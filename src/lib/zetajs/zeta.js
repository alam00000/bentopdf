/* -*- Mode: JS; tab-width: 2; indent-tabs-mode: nil; js-indent-level: 2; fill-column: 100 -*- */
// SPDX-License-Identifier: MIT

'use strict';

Module.zetajs = new Promise(function (resolve, reject) {
  Module.zetajs$resolve = function() {
    // A FinalizationRegistry for zetajs objects that own Embind objects that, in turn, should
    // be .delete()'d (so that Embind doesn't print any "Embind found a leaked C++ instance"
    // warnings for them); it is tied to Module so it doesn't itself get GC'ed early:
    Module.uno$zetajs_deleteRegistry = new FinalizationRegistry(function(value) {
      value.forEach((val) => val.delete());
    });
    const getProxyTarget = Symbol('getProxyTarget');
    const keepAlive = Symbol('keepAlive');
    function gcWrap(obj) {
      // Embind has already registered obj at some FinalizationRegistry that prints the
      // "Embind found a leaked C++ instance" warning, which we want to suppress; and if we
      // registered obj itself also at our deleting FinalizationRegistry, the Embind one might
      // fire first and still print the warning; so instead wrap obj in a Proxy and register
      // that:
      const proxy = new Proxy(obj, {});
      Module.uno$zetajs_deleteRegistry.register(proxy, [obj]);
      return proxy
    }
    function getEmbindSequenceCtor(componentType) {
      let typename = componentType.toString();
      let name = 'uno_Sequence';
      let n = 1;
      while (typename.startsWith('[]')) {
        typename = typename.substr(2);
        ++n;
      }
      if (n !== 1) {
        name += n;
      }
      name += '_' + typename.replace(/ /g, '_').replace(/\./g, '$');
      return Module[name];
    };
    function getTypeDescriptionManager() {
      const ctx = Module.getUnoComponentContext();
      const tdmAny = ctx.getValueByName(
        '/singletons/com.sun.star.reflection.theTypeDescriptionManager');
      ctx.delete();
      const val = tdmAny.get();
      tdmAny.delete();
      const tdm = Module.uno.com.sun.star.container.XHierarchicalNameAccess.query(val);
      val.delete();
      return tdm;
    };
    function translateTypeDescription(td) {
      switch (td.getTypeClass()) {
      case Module.uno.com.sun.star.uno.TypeClass.VOID:
        return Module.uno_Type.Void();
      case Module.uno.com.sun.star.uno.TypeClass.BOOLEAN:
        return Module.uno_Type.Boolean();
      case Module.uno.com.sun.star.uno.TypeClass.BYTE:
        return Module.uno_Type.Byte();
      case Module.uno.com.sun.star.uno.TypeClass.SHORT:
        return Module.uno_Type.Short();
      case Module.uno.com.sun.star.uno.TypeClass.UNSIGNED_SHORT:
        return Module.uno_Type.UnsignedShort();
      case Module.uno.com.sun.star.uno.TypeClass.LONG:
        return Module.uno_Type.Long();
      case Module.uno.com.sun.star.uno.TypeClass.UNSIGNED_LONG:
        return Module.uno_Type.UnsignedLong();
      case Module.uno.com.sun.star.uno.TypeClass.HYPER:
        return Module.uno_Type.Hyper();
      case Module.uno.com.sun.star.uno.TypeClass.UNSIGNED_HYPER:
        return Module.uno_Type.UnsignedHyper();
      case Module.uno.com.sun.star.uno.TypeClass.FLOAT:
        return Module.uno_Type.Float();
      case Module.uno.com.sun.star.uno.TypeClass.DOUBLE:
        return Module.uno_Type.Double();
      case Module.uno.com.sun.star.uno.TypeClass.CHAR:
        return Module.uno_Type.Char();
      case Module.uno.com.sun.star.uno.TypeClass.STRING:
        return Module.uno_Type.String();
      case Module.uno.com.sun.star.uno.TypeClass.TYPE:
        return Module.uno_Type.Type();
      case Module.uno.com.sun.star.uno.TypeClass.ANY:
        return Module.uno_Type.Any();
      case Module.uno.com.sun.star.uno.TypeClass.SEQUENCE:
        {
          const itd = Module.uno.com.sun.star.reflection.XIndirectTypeDescription.query(td);
          const rtd = itd.getReferencedType();
          itd.delete();
          const type = translateTypeDescriptionAndDelete(rtd);
          try {
            return Module.uno_Type.Sequence(type);
          } finally {
            type.delete();
          }
        }
      case Module.uno.com.sun.star.uno.TypeClass.ENUM:
        return Module.uno_Type.Enum(td.getName());
      case Module.uno.com.sun.star.uno.TypeClass.STRUCT:
        return Module.uno_Type.Struct(td.getName());
      case Module.uno.com.sun.star.uno.TypeClass.EXCEPTION:
        return Module.uno_Type.Exception(td.getName());
      case Module.uno.com.sun.star.uno.TypeClass.INTERFACE:
        return Module.uno_Type.Interface(td.getName());
      default:
        throw new Error(
          'bad type description ' + td.getName() + ' type class ' + td.getTypeClass());
      }
    };
    function translateTypeDescriptionAndDelete(td) {
      try {
        return translateTypeDescription(td);
      } finally {
        td.delete();
      }
    }
    function translateToEmbind(obj, type, toDelete) {
      switch (type.getTypeClass()) {
      case Module.uno.com.sun.star.uno.TypeClass.ANY:
          {
              const {any, owning} = translateToAny(obj, Module.uno_Type.Any());
              if (owning) {
                  toDelete.push(any);
              }
              return any;
          }
      case Module.uno.com.sun.star.uno.TypeClass.SEQUENCE:
          if (Array.isArray(obj)) {
              const ctype = type.getSequenceComponentType();
              const seq = new (getEmbindSequenceCtor(ctype))(
                  obj.length, Module.uno_Sequence.FromSize);
              for (let i = 0; i !== obj.length; ++i) {
                  seq.set(i, translateToEmbind(obj[i], ctype, toDelete));
              }
              ctype.delete();
              toDelete.push(seq);
              return seq;
          }
          break;
      case Module.uno.com.sun.star.uno.TypeClass.STRUCT:
      case Module.uno.com.sun.star.uno.TypeClass.EXCEPTION:
          {
              const val = {};
              function walk(td) {
                  const base = td.getBaseType();
                  if (base !== null) {
                      const td = Module.uno.com.sun.star.reflection.XCompoundTypeDescription
                          .query(base);
                      base.delete();
                      walk(td);
                      td.delete();
                  }
                  const types = td.getMemberTypes();
                  const names = td.getMemberNames();
                  for (let i = 0; i !== types.size(); ++i) {
                      const name = names.get(i);
                      const type = translateTypeDescriptionAndDelete(types.get(i));
                      val[name] = translateToEmbind(obj[name], type, toDelete);
                      type.delete();
                  }
                  types.delete();
                  names.delete();
              };
              const tdm = getTypeDescriptionManager();
              const tdAny = tdm.getByHierarchicalName(type.toString());
              tdm.delete();
              const ifc = tdAny.get();
              tdAny.delete();
              const td = Module.uno.com.sun.star.reflection.XCompoundTypeDescription.query(
                  ifc);
              ifc.delete();
              walk(td);
              td.delete();
              return val;
          }
      case Module.uno.com.sun.star.uno.TypeClass.INTERFACE:
          if (obj !== null) {
              const target = obj[getProxyTarget];
              const handle = target === undefined ? obj : target;
              if (handle instanceof Module.ClassHandle) {
                  if (type.toString() === 'com.sun.star.uno.XInterface') {
                      return handle;
                  }
                  const embindType = 'uno_Type_' + type.toString().replace(/\./g, '$');
                  if (embindType === handle.$$.ptrType.registeredClass.name) {
                      return handle;
                  } else {
                      const ifc = Module[embindType].query(handle);
                      toDelete.push(ifc);
                      return ifc;
                  }
              }
          }
          break;
      }
      return obj;
    };
    function translateToAny(obj, type) {
      try {
        let any;
        let owning;
        if (obj instanceof Module.uno_Any) {
          any = obj;
          owning = false;
        } else {
          let fromType;
          let val;
          if (type.getTypeClass() === Module.uno.com.sun.star.uno.TypeClass.ANY) {
            fromType = getAnyType(obj);
            if (fromType === undefined) {
              throw new Error('bad UNO method call argument ' + obj);
            }
            val = fromAny(obj);
          } else {
            fromType = type;
            val = obj;
          }
          const toDelete = [];
          any = new Module.uno_Any(fromType, translateToEmbind(val, fromType, toDelete));
          owning = true;
          toDelete.forEach((val) => val.delete());
        }
        return {any, owning};
      } finally {
        type.delete();
      }
    };
    function translateFromEmbind(val, type, precise, cleanUpVal) {
      switch (type.getTypeClass()) {
      case Module.uno.com.sun.star.uno.TypeClass.BOOLEAN:
        return Boolean(val);
      case Module.uno.com.sun.star.uno.TypeClass.TYPE:
        return gcWrap(val);
      case Module.uno.com.sun.star.uno.TypeClass.ANY:
        {
          const ty = gcWrap(val.getType());
          let v;
          try {
            v = translateFromEmbind(val.get(), ty, precise, cleanUpVal);
          } finally {
            if (cleanUpVal) {
              val.delete();
            }
          }
          return precise ? new Any(ty, v) : v;
        }
      case Module.uno.com.sun.star.uno.TypeClass.SEQUENCE:
        {
          const td = type.getSequenceComponentType();
          const arr = [];
          for (let i = 0; i !== val.size(); ++i) {
            arr.push(translateFromEmbind(val.get(i), td, precise, cleanUpVal));
          }
          if (cleanUpVal) {
            val.delete();
          }
          td.delete();
          return arr;
        }
      case Module.uno.com.sun.star.uno.TypeClass.STRUCT:
      case Module.uno.com.sun.star.uno.TypeClass.EXCEPTION:
        {
          const obj = {
            [Module.unoTagSymbol]: {
              kind: type.getTypeClass()
                == Module.uno.com.sun.star.uno.TypeClass.STRUCT
                ? 'struct-instance' : 'exception-instance',
              type: type.toString()
            }
          };
          function walk(td) {
            const base = td.getBaseType();
            if (base !== null) {
              const td = Module.uno.com.sun.star.reflection.XCompoundTypeDescription
                .query(base);
              base.delete();
              walk(td);
              td.delete();
            }
            const types = td.getMemberTypes();
            const names = td.getMemberNames();
            for (let i = 0; i !== types.size(); ++i) {
              const name = names.get(i);
              const td = translateTypeDescriptionAndDelete(types.get(i));
              obj[name] = translateFromEmbind(val[name], td, precise, cleanUpVal);
              td.delete();
            }
            types.delete();
            names.delete();
          };
          const tdm = getTypeDescriptionManager();
          const tdAny = tdm.getByHierarchicalName(type.toString());
          tdm.delete();
          const ifc = tdAny.get();
          tdAny.delete();
          const td = Module.uno.com.sun.star.reflection.XCompoundTypeDescription.query(
            ifc);
          ifc.delete();
          walk(td);
          td.delete();
          return obj;
        }
      case Module.uno.com.sun.star.uno.TypeClass.INTERFACE:
        return proxy(val);
      default:
        return val;
      }
    };
    function translateFromAny(any, type, precise) {
      if (type.getTypeClass() === Module.uno.com.sun.star.uno.TypeClass.ANY) {
        return translateFromEmbind(any, type, precise, false);
      } else {
        const td = any.getType();
        const val = translateFromEmbind(any.get(), td, precise, true);
        td.delete();
        return val;
      }
    };
    function translateFromAnyAndDelete(any, type, precise) {
      const val = translateFromAny(any, type, precise);
      any.delete();
      return val;
    };
    function proxy(unoObject) {
      if (unoObject === null) {
        return null;
      }
      const prox = {};
      const toDelete = [unoObject];
      Module.uno$zetajs_deleteRegistry.register(prox, toDelete);
      prox[getProxyTarget] = unoObject;
      prox.$precise = {[getProxyTarget]: unoObject, [keepAlive]: prox};
      // css.script.XInvocation2::getInfo invents additional members (e.g., an attribute "Foo"
      // if there is a method "getFoo"), so better determine the actual set of members via
      // css.lang.XTypeProvider::getTypes:
      const typeprov = Module.uno.com.sun.star.lang.XTypeProvider.query(unoObject);
      if (typeprov !== null) {
        const ty = Module.uno_Type.Interface('com.sun.star.uno.XInterface');
        const arg = new Module.uno_Any(ty, unoObject);
        ty.delete();
        const args = new Module.uno_Sequence_any([arg]);
        arg.delete();
        const ctx = Module.getUnoComponentContext();
        const serv = Module.uno.com.sun.star.script.Invocation.create(ctx);
        ctx.delete();
        const inst = serv.createInstanceWithArguments(args);
        args.delete();
        serv.delete();
        const invoke = Module.uno.com.sun.star.script.XInvocation2.query(inst);
        inst.delete();
        toDelete.push(invoke);
        function invokeMethod(name, args, precise) {
          const info = invoke.getInfoForName(name, true);
          try {
            if (args.length != info.aParamTypes.size()) {
              throw new Error(
                'bad number of arguments in call to ' + name + ', expected ' +
                  info.aParamTypes.size() + ' vs. actual ' + args.length);
            }
            const unoArgs = new Module.uno_Sequence_any(
              info.aParamTypes.size(), Module.uno_Sequence.FromSize);
            const deleteArgs = [];
            for (let i = 0; i !== info.aParamTypes.size(); ++i) {
              switch (info.aParamModes.get(i)) {
              case Module.uno.com.sun.star.reflection.ParamMode.IN:
                {
                  const {any, owning} = translateToAny(
                    args[i], info.aParamTypes.get(i));
                  unoArgs.set(i, any);
                  if (owning) {
                    deleteArgs.push(any);
                  }
                  break;
                }
              case Module.uno.com.sun.star.reflection.ParamMode.INOUT:
                {
                  const {any, owning} = translateToAny(
                    args[i].val, info.aParamTypes.get(i));
                  unoArgs.set(i, any);
                  if (owning) {
                    deleteArgs.push(any);
                  }
                  break;
                }
              }
            }
            const outparamindex_out = new Module.uno_InOutParam_sequence_short;
            const outparam_out = new Module.uno_InOutParam_sequence_any;
            let ret;
            try {
              ret = invoke.invoke(name, unoArgs, outparamindex_out, outparam_out);
            } catch (e) {
              outparamindex_out.delete();
              outparam_out.delete();
              const exc = catchUnoException(e);
              if (getAnyType(exc) ==
                'com.sun.star.reflection.InvocationTargetException')
              {
                throwUnoException(exc.TargetException);
              } else {
                throwUnoException(exc);
              }
            } finally {
              deleteArgs.forEach((arg) => arg.delete());
              unoArgs.delete();
            }
            const outparamindex = outparamindex_out.val;
            outparamindex_out.delete();
            const outparam = outparam_out.val;
            outparam_out.delete();
            for (let i = 0; i !== outparamindex.size(); ++i) {
              const j = outparamindex.get(i);
              const ty = info.aParamTypes.get(j);
              args[j].val = translateFromAnyAndDelete(outparam.get(i), ty, precise);
              ty.delete();
            }
            outparamindex.delete();
            outparam.delete();
            return translateFromAnyAndDelete(ret, info.aType, precise);
          } finally {
            info.aType.delete();
            info.aParamTypes.delete();
            info.aParamModes.delete();
          }
        };
        function invokeGetter(name, precise) {
          const info = invoke.getInfoForName(name, true);
          try {
            const ret = invoke.getValue(name);
            return translateFromAnyAndDelete(ret, info.aType, precise);
          } finally {
            info.aType.delete();
            info.aParamTypes.delete();
            info.aParamModes.delete();
          }
        };
        function invokeSetter(name, value) {
          const info = invoke.getInfoForName(name, true);
          const deleteArgs = [];
          const {any, owning} = translateToAny(value, info.aType);
          if (owning) {
            deleteArgs.push(any);
          }
          try {
            invoke.setValue(name, any);
          } finally {
            // info.aType already deleted in translateToAny above
            info.aParamTypes.delete();
            info.aParamModes.delete();
          }
        };
        prox.queryInterface = function() {
            return invokeMethod('queryInterface', arguments, false); };
        prox.$precise.queryInterface = function() {
            return invokeMethod('queryInterface', arguments, true); };
        const seen = {'com.sun.star.uno.XInterface': true};
        function walk(td) {
          const iname = td.getName();
          if (!Object.hasOwn(seen, iname)) {
            seen[iname] = true;
            if (td.getTypeClass() !== Module.uno.com.sun.star.uno.TypeClass.INTERFACE) {
              throw new Error('not a UNO interface type: ' + iname);
            }
            const itd = Module.uno.com.sun.star.reflection.XInterfaceTypeDescription2
                .query(td);
            const bases = itd.getBaseTypes();
            for (let i = 0; i !== bases.size(); ++i) {
              const base = bases.get(i);
              walk(base);
              base.delete();
            }
            bases.delete();
            const mems = itd.getMembers();
            for (let i = 0; i !== mems.size(); ++i) {
              const mem = mems.get(i);
              const name = mem.getMemberName();
              const atd = Module.uno.com.sun.star.reflection
                  .XInterfaceAttributeTypeDescription.query(mem);
              mem.delete();
              if (atd !== null) {
                Object.defineProperty(prox, name, {
                  enumerable: true,
                  get() { return invokeGetter(name, false); },
                  set: atd.isReadOnly()
                    ? undefined
                    : function(value) { return invokeSetter(name, value); }});
                Object.defineProperty(prox.$precise, name, {
                  enumerable: true,
                  get() { return invokeGetter(name, true); },
                  set: atd.isReadOnly()
                    ? undefined
                    : function(value) { return invokeSetter(name, value); }});
                atd.delete();
              } else {
                prox[name] = function() { return invokeMethod(name, arguments, false); };
                prox.$precise[name] = function() { return invokeMethod(name, arguments, true); };
              }
            }
            itd.delete();
            mems.delete();
            if (iname === 'com.sun.star.container.XEnumeration') {
              prox[Symbol.iterator] = function*() {
                while (prox.hasMoreElements()) {
                  yield prox.nextElement();
                }
              }
              prox.$precise[Symbol.iterator] = function*() {
                while (prox.$precise.hasMoreElements()) {
                  yield prox.$precise.nextElement();
                }
              }
            }
          }
        };
        const tdm = getTypeDescriptionManager();
        const types = typeprov.getTypes();
        typeprov.delete();
        for (let i = 0; i != types.size(); ++i) {
          const ty = types.get(i);
          const td = tdm.getByHierarchicalName(ty.toString());
          ty.delete();
          const ifc1 = td.get();
          td.delete();
          const ifc2 = Module.uno.com.sun.star.reflection.XTypeDescription.query(ifc1);
          ifc1.delete();
          walk(ifc2);
          ifc2.delete();
        }
        tdm.delete();
        types.delete();
      }
      return prox;
    };
    function singleton(name) {
      return function(context) {
        const any = context.getValueByName('/singletons/' + name);
        if (getAnyType(any).getTypeClass() !==
            Module.uno.com.sun.star.uno.TypeClass.INTERFACE
          || any === null)
        {
          throwUnoException(
            new uno.com.sun.star.uno.DeploymentException(
              {Message: 'cannot get singeleton ' + name}));
        }
        return any.val;
      };
    };
    function service(name, td) {
      const obj = {};
      const ctors = td.getConstructors();
      for (let i = 0; i !== ctors.size(); ++i) {
        const ctor = ctors.get(i);
        if (ctor.isDefaultConstructor()) {
          obj.create = function(context) {
            const ifc = context.getServiceManager().createInstanceWithContext(
              name, context);
            if (ifc === null) {
              throwUnoException(
                new uno.com.sun.star.uno.DeploymentException(
                  {Message:
                   'cannot instantiate single-interface service ' + name}));
            }
            return ifc;
          };
        } else {
          obj[ctor.getName()] = function() {
            const context = arguments[0];
            const args = [];
            const params = ctor.getParameters();
            for (let j = 0; j !== params.size(); ++j) {
              const param = params.get(j);
              if (param.isRestParameter()) {
                for (; j + 1 < arguments.length; ++j) {
                  args.push(arguments[j + 1]);
                }
                break;
              } else {
                let arg = arguments[j + 1];
                const ty = param.getType();
                if (ty.getTypeClass() !== Module.uno.com.sun.star.uno.TypeClass.ANY)
                {
                  arg = new Any(
                    gcWrap(translateTypeDescriptionAndDelete(param.getType())),
                    arg);
                }
                ty.delete();
                args.push(arg);
              }
              param.delete();
            }
            params.delete();
            const ifc = context.getServiceManager()
                  .createInstanceWithArgumentsAndContext(name, args, context);
            if (ifc === null) {
              throwUnoException(
                new uno.com.sun.star.uno.DeploymentException(
                  {Message:
                   'cannot instantiate single-interface service ' + name}));
            }
            return ifc;
          };
        }
      }
      ctors.delete();
      return obj;
    };
    function defaultValue(type) {
      switch (type.getTypeClass()) {
      case Module.uno.com.sun.star.uno.TypeClass.BOOLEAN:
        return false;
      case Module.uno.com.sun.star.uno.TypeClass.BYTE:
      case Module.uno.com.sun.star.uno.TypeClass.SHORT:
      case Module.uno.com.sun.star.uno.TypeClass.UNSIGNED_SHORT:
      case Module.uno.com.sun.star.uno.TypeClass.LONG:
      case Module.uno.com.sun.star.uno.TypeClass.UNSIGNED_LONG:
      case Module.uno.com.sun.star.uno.TypeClass.FLOAT:
      case Module.uno.com.sun.star.uno.TypeClass.DOUBLE:
        return 0;
      case Module.uno.com.sun.star.uno.TypeClass.HYPER:
      case Module.uno.com.sun.star.uno.TypeClass.UNSIGNED_HYPER:
        return 0n;
      case Module.uno.com.sun.star.uno.TypeClass.CHAR:
        return '\0';
      case Module.uno.com.sun.star.uno.TypeClass.STRING:
        return '';
      case Module.uno.com.sun.star.uno.TypeClass.TYPE:
        return Module.uno_Type.Void();
      case Module.uno.com.sun.star.uno.TypeClass.ANY:
        return undefined;
      case Module.uno.com.sun.star.uno.TypeClass.SEQUENCE:
        return [];
      case Module.uno.com.sun.star.uno.TypeClass.ENUM:
        {
          const tdm = getTypeDescriptionManager();
          const tdAny = tdm.getByHierarchicalName(type.toString());
          tdm.delete();
          const ifc = tdAny.get();
          tdAny.delete();
          const td = Module.uno.com.sun.star.reflection.XEnumTypeDescription.query(ifc);
          ifc.delete();
          const names = td.getEnumNames();
          td.delete();
          const first = names.get(0);
          names.delete();
          return Module['uno_Type_' + type.toString().replace(/\./g, '$')][first];
        }
      case Module.uno.com.sun.star.uno.TypeClass.STRUCT:
        {
          //TODO: Make val an instanceof the corresponding struct constructor function:
          const tdm = getTypeDescriptionManager();
          const tdAny = tdm.getByHierarchicalName(type.toString());
          tdm.delete();
          const ifc = tdAny.get();
          tdAny.delete();
          const td = Module.uno.com.sun.star.reflection.XTypeDescription.query(ifc);
          ifc.delete();
          const members = {};
          computeMembers(td, members);
          td.delete();
          const val = {};
          populate(val, [], members);
          return val;
        }
      case Module.uno.com.sun.star.uno.TypeClass.INTERFACE:
        return null;
      default:
        throw new Error('bad member type ' + type);
      }
    }
    function TypeArgumentIndex(index) { this.index = index; };
    function computeMembers(type, obj) {
      const td = Module.uno.com.sun.star.reflection.XCompoundTypeDescription.query(type);
      const base = td.getBaseType();
      if (base !== null) {
        computeMembers(base, obj);
        base.delete();
      }
      const types = td.getMemberTypes();
      const names = td.getMemberNames();
      td.delete();
      for (let i = 0; i !== types.size(); ++i) {
        const memtype = types.get(i);
        let val;
        if (memtype.getTypeClass() === Module.uno.com.sun.star.uno.TypeClass.UNKNOWN) {
          const paramName = memtype.getName();
          const std = Module.uno.com.sun.star.reflection.XStructTypeDescription.query(
            type);
          const params = std.getTypeParameters();
          std.delete();
          let index = 0;
          for (; index !== params.size(); ++index) {
            if (params.get(index) === paramName) {
              break;
            }
          }
          params.delete();
          val = new TypeArgumentIndex(index);
        } else {
          const type = translateTypeDescription(memtype);
          val = defaultValue(type);
          type.delete();
        }
        memtype.delete();
        obj[names.get(i)] = val;
      }
      types.delete();
      names.delete();
    };
    function populate(obj, types, members, values) {
      for (let i in members) {
        let val;
        if (values !== undefined && i in values) {
          val = values[i];
        } else {
          val = members[i];
          if (val instanceof TypeArgumentIndex) {
            val = defaultValue(types[val.index]);
          }
        }
        obj[i] = val;
      }
    };
    function instantiationName(templateName, types) {
      let name = templateName + '<';
      for (let i = 0; i !== types.length; ++i) {
        if (i !== 0) {
          name += ',';
        }
        name += types[i];
      }
      return name + '>';
    }
    function unoidlProxy(path, embindObject) {
      return new Proxy({}, {
        get(target, prop) {
          if (!Object.hasOwn(target, prop)) {
            const name = path + '.' + prop;
            const tdm = getTypeDescriptionManager();
            const tdAny = tdm.getByHierarchicalName(name);
            tdm.delete();
            const ifc = tdAny.get();
            tdAny.delete();
            const td = Module.uno.com.sun.star.reflection.XTypeDescription.query(ifc);
            ifc.delete();
            switch (td.getTypeClass()) {
            case Module.uno.com.sun.star.uno.TypeClass.ENUM:
              target[prop] = embindObject[prop];
              target[prop][Module.unoTagSymbol] = {kind: 'enum', type: name};
              break;
            case Module.uno.com.sun.star.uno.TypeClass.STRUCT:
              {
                const members = {};
                computeMembers(td, members);
                const std = Module.uno.com.sun.star.reflection
                  .XStructTypeDescription.query(td);
                const params = std.getTypeParameters();
                std.delete();
                const paramCount = params.size();
                params.delete();
                if (paramCount === 0) {
                  target[prop] = function(values) {
                    populate(this, [], members, values);
                    this[Module.unoTagSymbol] = {
                      kind: 'struct-instance', type: name};
                  };
                } else {
                  target[prop] = function(types, values) {
                    if (types.length !== paramCount) {
                      throw new Error(
                        'bad number of type arguments in call to ' + name +
                          ', expected ' + paramCount + ' vs. actual ' +
                          types.length);
                    }
                    populate(this, types, members, values);
                    this[Module.unoTagSymbol] = {
                      kind: 'struct-instance',
                      type: instantiationName(name, types)};
                  };
                }
                target[prop][Module.unoTagSymbol] = {kind: 'struct', type: name};
                break;
              }
            case Module.uno.com.sun.star.uno.TypeClass.EXCEPTION:
              {
                const members = {};
                computeMembers(td, members);
                target[prop] = function(values) {
                  populate(this, [], members, values);
                  this[Module.unoTagSymbol] = {
                    kind: 'exception-instance', type: name};
                };
                target[prop][Module.unoTagSymbol] = {kind: 'exception', type: name};
                break;
              }
            case Module.uno.com.sun.star.uno.TypeClass.INTERFACE:
              target[prop] = {[Module.unoTagSymbol]: {kind: 'interface', type: name}};
              break;
            case Module.uno.com.sun.star.uno.TypeClass.MODULE:
              target[prop] = unoidlProxy(name, embindObject[prop]);
              break;
            case Module.uno.com.sun.star.uno.TypeClass.SINGLETON:
              target[prop] = singleton(name);
              break;
            case Module.uno.com.sun.star.uno.TypeClass.SERVICE:
              {
                const std = Module.uno.com.sun.star.reflection
                  .XServiceTypeDescription2.query(td);
                if (std.isSingleInterfaceBased()) {
                  target[prop] = service(name, std);
                }
                std.delete();
                break;
              }
            case Module.uno.com.sun.star.uno.TypeClass.CONSTANTS:
              target[prop] = embindObject[prop];
              break;
            }
            td.delete();
          }
          return target[prop];
        }
      });
    };
    function Any(type, val) {
      this.type = type;
      this.val = val;
    };
    function getAnyType(val) {
      switch (typeof val) {
      case 'undefined':
        return gcWrap(Module.uno_Type.Void());
      case 'boolean':
        return gcWrap(Module.uno_Type.Boolean());
      case 'number':
        return gcWrap(
          Number.isInteger(val) && val >= -0x80000000 && val < 0x80000000
            ? Module.uno_Type.Long()
            : Number.isInteger(val) && val >= 0 && val < 0x100000000
            ? Module.uno_Type.UnsignedLong()
            : Module.uno_Type.Double());
      case 'bigint':
        return gcWrap(
          val < 0x8000000000000000n
            ? Module.uno_Type.Hyper() : Module.uno_Type.UnsignedHyper());
      case 'string':
        return gcWrap(Module.uno_Type.String());
      case 'object':
        if (val === null || Object.hasOwn(val, getProxyTarget)) {
          return gcWrap(Module.uno_Type.Interface('com.sun.star.uno.XInterface'));
        } else if (val instanceof Module.uno_Type) {
          return gcWrap(Module.uno_Type.Type());
        } else if (val instanceof Any) {
          return val.type;
        } else if (val instanceof Array) {
          const t = Module.uno_Type.Any();
          try {
            return gcWrap(Module.uno_Type.Sequence(t));
          } finally {
            t.delete();
          }
        } else {
          const tag = val[Module.unoTagSymbol];
          if (tag !== undefined) {
            if (tag.kind === 'enumerator') {
              return gcWrap(Module.uno_Type.Enum(tag.type));
            } else if (tag.kind === 'struct-instance') {
              return gcWrap(Module.uno_Type.Struct(tag.type));
            } else if (tag.kind === 'exception-instance') {
              return gcWrap(Module.uno_Type.Exception(tag.type));
            }
          }
        }
        // fallthrough
      default:
        return undefined;
      }
    };
    function fromAny(val) { return val instanceof Any ? val.val : val; };
    function throwUnoException(exception) {
      const type = gcWrap(Module.uno_Type.Exception(exception[Module.unoTagSymbol].type));
      const toDelete = [];
      const val = translateToEmbind(exception, type, toDelete);
      Module.throwUnoException(type, val, toDelete);
    };
    function catchUnoException(exception) {
        const td = Module.uno_Type.Any();
        try {
          return translateFromAnyAndDelete(Module.catchUnoException(exception), td);
        } finally {
          td.delete();
        }
    };
    const uno = new Proxy({}, {
      get(target, prop) {
        if (!Object.hasOwn(target, prop)) {
          const tdm = getTypeDescriptionManager();
          const td = tdm.getByHierarchicalName(prop);
          tdm.delete();
          td.delete();
          target[prop] = unoidlProxy(prop, Module.uno[prop]);
        }
        return target[prop];
      }
    });
    const zetajs = {
      type: {
        void: gcWrap(Module.uno_Type.Void()),
        boolean: gcWrap(Module.uno_Type.Boolean()),
        byte: gcWrap(Module.uno_Type.Byte()),
        short: gcWrap(Module.uno_Type.Short()),
        unsigned_short: gcWrap(Module.uno_Type.UnsignedShort()),
        long: gcWrap(Module.uno_Type.Long()),
        unsigned_long: gcWrap(Module.uno_Type.UnsignedLong()),
        hyper: gcWrap(Module.uno_Type.Hyper()),
        unsigned_hyper: gcWrap(Module.uno_Type.UnsignedHyper()),
        float: gcWrap(Module.uno_Type.Float()),
        double: gcWrap(Module.uno_Type.Double()),
        char: gcWrap(Module.uno_Type.Char()),
        string: gcWrap(Module.uno_Type.String()),
        type: gcWrap(Module.uno_Type.Type()),
        any: gcWrap(Module.uno_Type.Any()),
        sequence(type) { return gcWrap(Module.uno_Type.Sequence(type)); },
        enum(name) {
          if (typeof name === 'function' && Object.hasOwn(name, Module.unoTagSymbol)
            && name[Module.unoTagSymbol].kind === 'enum')
          {
            name = name[Module.unoTagSymbol].type;
          }
          return gcWrap(Module.uno_Type.Enum(name));
        },
        struct(name) {
          if (typeof name === 'function' && Object.hasOwn(name, Module.unoTagSymbol)
            && name[Module.unoTagSymbol].kind === 'struct')
          {
            name = name[Module.unoTagSymbol].type;
          }
          return gcWrap(Module.uno_Type.Struct(name));
        },
        exception(name) {
          if (typeof name === 'function' && Object.hasOwn(name, Module.unoTagSymbol)
            && name[Module.unoTagSymbol].kind === 'exception')
          {
            name = name[Module.unoTagSymbol].type;
          }
          return gcWrap(Module.uno_Type.Exception(name));
        },
        interface(name) {
          if (typeof name === 'object' && Object.hasOwn(name, Module.unoTagSymbol)
            && name[Module.unoTagSymbol].kind === 'interface')
          {
            name = name[Module.unoTagSymbol].type;
          }
          return gcWrap(Module.uno_Type.Interface(name));
        }
      },
      Any,
      getAnyType,
      fromAny,
      sameUnoObject: function(obj1, obj2) {
        const type = Module.uno_Type.Interface('com.sun.star.uno.XInterface');
        const toDelete = [];
        try {
          return Module.sameUnoObject(
            translateToEmbind(obj1, type, toDelete),
            translateToEmbind(obj2, type, toDelete));
        } finally {
          type.delete();
          toDelete.forEach((val) => val.delete());
        }
      },
      getUnoComponentContext: function() {
        return proxy(Module.getUnoComponentContext());
      },
      throwUnoException,
      catchUnoException,
      uno,
      unoObject: function(interfaces, obj) {
        const wrapper = {};
        const toDelete = [];
        Module.uno$zetajs_deleteRegistry.register(wrapper, toDelete);
        const seen = {
          'com.sun.star.lang.XTypeProvider': true, 'com.sun.star.uno.XInterface': true};
        function walk(td) {
          const iname = td.getName();
          if (!Object.hasOwn(seen, iname)) {
            seen[iname] = true;
            if (td.getTypeClass() !== Module.uno.com.sun.star.uno.TypeClass.INTERFACE) {
              throw new Error('not a UNO interface type: ' + iname);
            }
            const itd = Module.uno.com.sun.star.reflection.XInterfaceTypeDescription2
                  .query(td);
            const bases = itd.getBaseTypes();
            for (let i = 0; i !== bases.size(); ++i) {
              const base = bases.get(i);
              walk(base);
              base.delete();
            }
            bases.delete();
            const mems = itd.getMembers();
            itd.delete();
            for (let i = 0; i !== mems.size(); ++i) {
              const ifc = mems.get(i);
              const atd = Module.uno.com.sun.star.reflection
                .XInterfaceAttributeTypeDescription.query(ifc);
              ifc.delete();
              if (atd !== null) {
                const aname = atd.getMemberName();
                const type = translateTypeDescriptionAndDelete(atd.getType());
                toDelete.push(type);
                wrapper['get' + aname] = function() {
                  return translateToEmbind(
                    obj['get' + aname].apply(obj), type, []);
                };
                if (!atd.isReadOnly()) {
                  wrapper['set' + aname] = function() {
                    obj['set' + aname].apply(
                      obj, [translateFromEmbind(arguments[0], type, true, false)]);
                  };
                }
                atd.delete();
              } else {
                const ifc = mems.get(i);
                const mtd = Module.uno.com.sun.star.reflection
                  .XInterfaceMethodTypeDescription.query(ifc);
                ifc.delete();
                const mname = mtd.getMemberName();
                const retType = translateTypeDescriptionAndDelete(
                  mtd.getReturnType());
                toDelete.push(retType);
                const params = [];
                const descrs = mtd.getParameters();
                mtd.delete();
                for (let j = 0; j !== descrs.size(); ++j) {
                  const descr = descrs.get(j);
                  const type = translateTypeDescriptionAndDelete(descr.getType());
                  toDelete.push(type);
                  params.push({type, dirIn: descr.isIn(), dirOut: descr.isOut()});
                  descr.delete();
                }
                descrs.delete();
                wrapper[mname] = function() {
                  const args = [];
                  for (let i = 0; i !== params.length; ++i) {
                    let arg;
                    if (params[i].dirOut) {
                      arg = {};
                      if (params[i].dirIn) {
                        arg.val = translateFromEmbind(
                          arguments[i].val, params[i].type, true, false);
                      }
                    } else {
                      arg = translateFromEmbind(
                        arguments[i], params[i].type, true, false);
                    }
                    args.push(arg);
                  }
                  const ret = translateToEmbind(
                    obj[mname].apply(obj, args), retType, []);
                  for (let i = 0; i !== params.length; ++i) {
                    if (params[i].dirOut) {
                      arguments[i].val = translateToEmbind(
                        args[i].val, params[i].type, []);
                    }
                  }
                  return ret;
                };
              }
            }
            mems.delete();
          }
        };
        const tdm = getTypeDescriptionManager();
        const interfaceNames = [];
        interfaces.forEach((i) => {
          let name = i;
          if (typeof name === 'object' && Object.hasOwn(name, Module.unoTagSymbol)
              && name[Module.unoTagSymbol].kind === 'interface')
          {
              name = name[Module.unoTagSymbol].type;
          } else if (name instanceof Module.uno_Type
                     && (name.getTypeClass()
                         === Module.uno.com.sun.star.uno.TypeClass.INTERFACE))
          {
            name = name.toString();
          }
          interfaceNames.push(name);
          const tdAny = tdm.getByHierarchicalName(name);
          const ifc = tdAny.get();
          const td = Module.uno.com.sun.star.reflection.XTypeDescription.query(ifc);
          ifc.delete();
          walk(td);
          td.delete();
        })
        tdm.delete();
        return proxy(Module.unoObject(interfaceNames, wrapper));
      },
      mainPort: Module.uno_mainPort
    };
    resolve(zetajs);
  };
  Module.zetajs$reject = reject;
});

Module.uno_init.then(function() { Module.zetajs$resolve(); });

/* vim:set shiftwidth=2 softtabstop=2 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */