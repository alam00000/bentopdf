/*
 * Vendored from @neslinesli93/qpdf-wasm@0.3.0 (qpdf 12.2.0 compiled to WASM).
 * npm package: https://www.npmjs.com/package/@neslinesli93/qpdf-wasm
 * Source: https://github.com/neslinesli93/qpdf-wasm - upstream qpdf: https://qpdf.github.io/qpdf/
 * The binary payload (qpdf.wasm) is licensed under Apache-2.0 (qpdf) and the
 * JS loader under ISC (this packaging). This file is byte-identical to the npm
 * artifact (dist/qpdf.js) except for this inert header note.
 */
var Module = (() => {
  var _scriptName =
    typeof document != 'undefined' ? document.currentScript?.src : undefined;
  if (typeof __filename != 'undefined') _scriptName = _scriptName || __filename;
  return function (moduleArg = {}) {
    var moduleRtn;

    var f = moduleArg,
      aa,
      ba,
      ca = new Promise((a, b) => {
        aa = a;
        ba = b;
      }),
      da = 'object' == typeof window,
      ea = 'undefined' != typeof WorkerGlobalScope,
      fa =
        'object' == typeof process &&
        'object' == typeof process.versions &&
        'string' == typeof process.versions.node &&
        'renderer' != process.type;
    f.noInitialRun = !0;
    var ha = Object.assign({}, f),
      ia = [],
      ja = './this.program',
      ka = (a, b) => {
        throw b;
      },
      p = '',
      la,
      ma;
    if (fa) {
      var fs = require('fs');
      require('path');
      p = __dirname + '/';
      ma = (a) => {
        a = na(a) ? new URL(a) : a;
        return fs.readFileSync(a);
      };
      la = async (a) => {
        a = na(a) ? new URL(a) : a;
        return fs.readFileSync(a, void 0);
      };
      !f.thisProgram &&
        1 < process.argv.length &&
        (ja = process.argv[1].replace(/\\/g, '/'));
      ia = process.argv.slice(2);
      ka = (a, b) => {
        process.exitCode = a;
        throw b;
      };
    } else if (da || ea)
      (ea
        ? (p = self.location.href)
        : 'undefined' != typeof document &&
          document.currentScript &&
          (p = document.currentScript.src),
        _scriptName && (p = _scriptName),
        p.startsWith('blob:')
          ? (p = '')
          : (p = p.substr(0, p.replace(/[?#].*/, '').lastIndexOf('/') + 1)),
        ea &&
          (ma = (a) => {
            var b = new XMLHttpRequest();
            b.open('GET', a, !1);
            b.responseType = 'arraybuffer';
            b.send(null);
            return new Uint8Array(b.response);
          }),
        (la = async (a) => {
          if (na(a))
            return new Promise((c, d) => {
              var e = new XMLHttpRequest();
              e.open('GET', a, !0);
              e.responseType = 'arraybuffer';
              e.onload = () => {
                200 == e.status || (0 == e.status && e.response)
                  ? c(e.response)
                  : d(e.status);
              };
              e.onerror = d;
              e.send(null);
            });
          var b = await fetch(a, { credentials: 'same-origin' });
          if (b.ok) return b.arrayBuffer();
          throw Error(b.status + ' : ' + b.url);
        }));
    var oa = console.log.bind(console),
      r = console.error.bind(console);
    Object.assign(f, ha);
    ha = null;
    var pa,
      qa = !1,
      ra,
      u,
      w,
      sa,
      x,
      y,
      z;
    function ta() {
      var a = pa.buffer;
      f.HEAP8 = u = new Int8Array(a);
      f.HEAP16 = sa = new Int16Array(a);
      f.HEAPU8 = w = new Uint8Array(a);
      f.HEAPU16 = new Uint16Array(a);
      f.HEAP32 = x = new Int32Array(a);
      f.HEAPU32 = y = new Uint32Array(a);
      f.HEAPF32 = new Float32Array(a);
      f.HEAPF64 = new Float64Array(a);
      f.HEAP64 = z = new BigInt64Array(a);
      f.HEAPU64 = new BigUint64Array(a);
    }
    var ua = [],
      va = [],
      wa = [],
      xa = [],
      ya = 0,
      za = null;
    function Aa() {
      ya--;
      if (0 == ya && za) {
        var a = za;
        za = null;
        a();
      }
    }
    function A(a) {
      a = 'Aborted(' + a + ')';
      r(a);
      qa = !0;
      a = new WebAssembly.RuntimeError(
        a + '. Build with -sASSERTIONS for more info.'
      );
      ba(a);
      throw a;
    }
    var Ba = (a) => a.startsWith('data:application/octet-stream;base64,'),
      na = (a) => a.startsWith('file://'),
      Ca;
    async function Da(a) {
      try {
        var b = await la(a);
        return new Uint8Array(b);
      } catch {}
      if (ma) a = ma(a);
      else throw 'both async and sync fetching of the wasm failed';
      return a;
    }
    async function Ea(a, b) {
      try {
        var c = await Da(a);
        return await WebAssembly.instantiate(c, b);
      } catch (d) {
        (r(`failed to asynchronously prepare wasm: ${d}`), A(d));
      }
    }
    async function Fa(a) {
      var b = Ca;
      if (
        !(
          'function' != typeof WebAssembly.instantiateStreaming ||
          Ba(b) ||
          na(b) ||
          fa
        ) &&
        'function' == typeof fetch
      )
        try {
          var c = fetch(b, { credentials: 'same-origin' });
          return await WebAssembly.instantiateStreaming(c, a);
        } catch (d) {
          (r(`wasm streaming compile failed: ${d}`),
            r('falling back to ArrayBuffer instantiation'));
        }
      return Ea(b, a);
    }
    class Ga {
      name = 'ExitStatus';
      constructor(a) {
        this.message = `Program terminated with exit(${a})`;
        this.status = a;
      }
    }
    var Ha = (a) => {
        for (; 0 < a.length; ) a.shift()(f);
      },
      Ia = 'undefined' != typeof TextDecoder ? new TextDecoder() : void 0,
      B = (a, b = 0) => {
        for (var c = b + NaN, d = b; a[d] && !(d >= c); ) ++d;
        if (16 < d - b && a.buffer && Ia) return Ia.decode(a.subarray(b, d));
        for (c = ''; b < d; ) {
          var e = a[b++];
          if (e & 128) {
            var g = a[b++] & 63;
            if (192 == (e & 224)) c += String.fromCharCode(((e & 31) << 6) | g);
            else {
              var h = a[b++] & 63;
              e =
                224 == (e & 240)
                  ? ((e & 15) << 12) | (g << 6) | h
                  : ((e & 7) << 18) | (g << 12) | (h << 6) | (a[b++] & 63);
              65536 > e
                ? (c += String.fromCharCode(e))
                : ((e -= 65536),
                  (c += String.fromCharCode(
                    55296 | (e >> 10),
                    56320 | (e & 1023)
                  )));
            }
          } else c += String.fromCharCode(e);
        }
        return c;
      },
      Ja = [],
      Ka = 0,
      D = 0;
    class La {
      constructor(a) {
        this.nb = a;
        this.wa = a - 24;
      }
      Pa(a, b) {
        y[(this.wa + 16) >> 2] = 0;
        y[(this.wa + 4) >> 2] = a;
        y[(this.wa + 8) >> 2] = b;
      }
    }
    var Oa = (a) => {
        var b = D;
        if (!b) return (Ma(0), 0);
        var c = new La(b);
        y[(c.wa + 16) >> 2] = b;
        var d = y[(c.wa + 4) >> 2];
        if (!d) return (Ma(0), b);
        for (var e of a) {
          if (0 === e || e === d) break;
          if (Na(e, d, c.wa + 16)) return (Ma(e), b);
        }
        Ma(d);
        return b;
      },
      E = () => {
        var a = x[+Pa >> 2];
        Pa += 4;
        return a;
      },
      Qa = (a, b) => {
        for (var c = 0, d = a.length - 1; 0 <= d; d--) {
          var e = a[d];
          '.' === e
            ? a.splice(d, 1)
            : '..' === e
              ? (a.splice(d, 1), c++)
              : c && (a.splice(d, 1), c--);
        }
        if (b) for (; c; c--) a.unshift('..');
        return a;
      },
      F = (a) => {
        var b = '/' === a.charAt(0),
          c = '/' === a.substr(-1);
        (a = Qa(
          a.split('/').filter((d) => !!d),
          !b
        ).join('/')) ||
          b ||
          (a = '.');
        a && c && (a += '/');
        return (b ? '/' : '') + a;
      },
      Ra = (a) => {
        var b = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/
          .exec(a)
          .slice(1);
        a = b[0];
        b = b[1];
        if (!a && !b) return '.';
        b &&= b.substr(0, b.length - 1);
        return a + b;
      },
      Sa = (a) => {
        if ('/' === a) return '/';
        a = F(a);
        a = a.replace(/\/$/, '');
        var b = a.lastIndexOf('/');
        return -1 === b ? a : a.substr(b + 1);
      },
      Ua = (...a) => F(a.join('/')),
      Va = (a, b) => F(a + '/' + b),
      Wa = () => {
        if (
          'object' == typeof crypto &&
          'function' == typeof crypto.getRandomValues
        )
          return (c) => crypto.getRandomValues(c);
        if (fa)
          try {
            var a = require('crypto');
            if (a.randomFillSync) return (c) => a.randomFillSync(c);
            var b = a.randomBytes;
            return (c) => (c.set(b(c.byteLength)), c);
          } catch (c) {}
        A('initRandomDevice');
      },
      Xa = (a) => (Xa = Wa())(a),
      Ya = (...a) => {
        for (var b = '', c = !1, d = a.length - 1; -1 <= d && !c; d--) {
          c = 0 <= d ? a[d] : G.cwd();
          if ('string' != typeof c)
            throw new TypeError('Arguments to path.resolve must be strings');
          if (!c) return '';
          b = c + '/' + b;
          c = '/' === c.charAt(0);
        }
        b = Qa(
          b.split('/').filter((e) => !!e),
          !c
        ).join('/');
        return (c ? '/' : '') + b || '.';
      },
      Za = (a, b) => {
        function c(h) {
          for (var k = 0; k < h.length && '' === h[k]; k++);
          for (var m = h.length - 1; 0 <= m && '' === h[m]; m--);
          return k > m ? [] : h.slice(k, m - k + 1);
        }
        a = Ya(a).substr(1);
        b = Ya(b).substr(1);
        a = c(a.split('/'));
        b = c(b.split('/'));
        for (var d = Math.min(a.length, b.length), e = d, g = 0; g < d; g++)
          if (a[g] !== b[g]) {
            e = g;
            break;
          }
        d = [];
        for (g = e; g < a.length; g++) d.push('..');
        d = d.concat(b.slice(e));
        return d.join('/');
      },
      $a = [],
      ab = (a) => {
        for (var b = 0, c = 0; c < a.length; ++c) {
          var d = a.charCodeAt(c);
          127 >= d
            ? b++
            : 2047 >= d
              ? (b += 2)
              : 55296 <= d && 57343 >= d
                ? ((b += 4), ++c)
                : (b += 3);
        }
        return b;
      },
      bb = (a, b, c, d) => {
        if (!(0 < d)) return 0;
        var e = c;
        d = c + d - 1;
        for (var g = 0; g < a.length; ++g) {
          var h = a.charCodeAt(g);
          if (55296 <= h && 57343 >= h) {
            var k = a.charCodeAt(++g);
            h = (65536 + ((h & 1023) << 10)) | (k & 1023);
          }
          if (127 >= h) {
            if (c >= d) break;
            b[c++] = h;
          } else {
            if (2047 >= h) {
              if (c + 1 >= d) break;
              b[c++] = 192 | (h >> 6);
            } else {
              if (65535 >= h) {
                if (c + 2 >= d) break;
                b[c++] = 224 | (h >> 12);
              } else {
                if (c + 3 >= d) break;
                b[c++] = 240 | (h >> 18);
                b[c++] = 128 | ((h >> 12) & 63);
              }
              b[c++] = 128 | ((h >> 6) & 63);
            }
            b[c++] = 128 | (h & 63);
          }
        }
        b[c] = 0;
        return c - e;
      };
    function cb(a) {
      var b = Array(ab(a) + 1);
      a = bb(a, b, 0, b.length);
      b.length = a;
      return b;
    }
    var db = [];
    function eb(a, b) {
      db[a] = { input: [], output: [], Ea: b };
      fb(a, gb);
    }
    var gb = {
        open(a) {
          var b = db[a.node.rdev];
          if (!b) throw new G.oa(43);
          a.tty = b;
          a.seekable = !1;
        },
        close(a) {
          a.tty.Ea.fsync(a.tty);
        },
        fsync(a) {
          a.tty.Ea.fsync(a.tty);
        },
        read(a, b, c, d) {
          if (!a.tty || !a.tty.Ea.pb) throw new G.oa(60);
          for (var e = 0, g = 0; g < d; g++) {
            try {
              var h = a.tty.Ea.pb(a.tty);
            } catch (k) {
              throw new G.oa(29);
            }
            if (void 0 === h && 0 === e) throw new G.oa(6);
            if (null === h || void 0 === h) break;
            e++;
            b[c + g] = h;
          }
          e && (a.node.atime = Date.now());
          return e;
        },
        write(a, b, c, d) {
          if (!a.tty || !a.tty.Ea.eb) throw new G.oa(60);
          try {
            for (var e = 0; e < d; e++) a.tty.Ea.eb(a.tty, b[c + e]);
          } catch (g) {
            throw new G.oa(29);
          }
          d && (a.node.mtime = a.node.ctime = Date.now());
          return e;
        },
      },
      hb = {
        pb() {
          a: {
            if (!$a.length) {
              var a = null;
              if (fa) {
                var b = Buffer.alloc(256),
                  c = 0,
                  d = process.stdin.fd;
                try {
                  c = fs.readSync(d, b, 0, 256);
                } catch (e) {
                  if (e.toString().includes('EOF')) c = 0;
                  else throw e;
                }
                0 < c && (a = b.slice(0, c).toString('utf-8'));
              } else
                'undefined' != typeof window &&
                  'function' == typeof window.prompt &&
                  ((a = window.prompt('Input: ')), null !== a && (a += '\n'));
              if (!a) {
                a = null;
                break a;
              }
              $a = cb(a);
            }
            a = $a.shift();
          }
          return a;
        },
        eb(a, b) {
          null === b || 10 === b
            ? (oa(B(a.output)), (a.output = []))
            : 0 != b && a.output.push(b);
        },
        fsync(a) {
          a.output && 0 < a.output.length && (oa(B(a.output)), (a.output = []));
        },
        Lb() {
          return {
            Yb: 25856,
            $b: 5,
            Xb: 191,
            Zb: 35387,
            Wb: [
              3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            ],
          };
        },
        Mb() {
          return 0;
        },
        Nb() {
          return [24, 80];
        },
      },
      ib = {
        eb(a, b) {
          null === b || 10 === b
            ? (r(B(a.output)), (a.output = []))
            : 0 != b && a.output.push(b);
        },
        fsync(a) {
          a.output && 0 < a.output.length && (r(B(a.output)), (a.output = []));
        },
      };
    function jb(a, b) {
      var c = a.ra ? a.ra.length : 0;
      c >= b ||
        ((b = Math.max(b, (c * (1048576 > c ? 2 : 1.125)) >>> 0)),
        0 != c && (b = Math.max(b, 256)),
        (c = a.ra),
        (a.ra = new Uint8Array(b)),
        0 < a.ta && a.ra.set(c.subarray(0, a.ta), 0));
    }
    var H = {
        Da: null,
        sa() {
          return H.createNode(null, '/', 16895, 0);
        },
        createNode(a, b, c, d) {
          if (24576 === (c & 61440) || G.isFIFO(c)) throw new G.oa(63);
          H.Da ||
            (H.Da = {
              dir: {
                node: {
                  ya: H.pa.ya,
                  ua: H.pa.ua,
                  lookup: H.pa.lookup,
                  Aa: H.pa.Aa,
                  rename: H.pa.rename,
                  unlink: H.pa.unlink,
                  rmdir: H.pa.rmdir,
                  readdir: H.pa.readdir,
                  symlink: H.pa.symlink,
                },
                stream: { va: H.qa.va },
              },
              file: {
                node: { ya: H.pa.ya, ua: H.pa.ua },
                stream: {
                  va: H.qa.va,
                  read: H.qa.read,
                  write: H.qa.write,
                  Oa: H.qa.Oa,
                  Ia: H.qa.Ia,
                  La: H.qa.La,
                },
              },
              link: {
                node: { ya: H.pa.ya, ua: H.pa.ua, readlink: H.pa.readlink },
                stream: {},
              },
              jb: { node: { ya: H.pa.ya, ua: H.pa.ua }, stream: G.Db },
            });
          c = G.createNode(a, b, c, d);
          J(c.mode)
            ? ((c.pa = H.Da.dir.node), (c.qa = H.Da.dir.stream), (c.ra = {}))
            : G.isFile(c.mode)
              ? ((c.pa = H.Da.file.node),
                (c.qa = H.Da.file.stream),
                (c.ta = 0),
                (c.ra = null))
              : 40960 === (c.mode & 61440)
                ? ((c.pa = H.Da.link.node), (c.qa = H.Da.link.stream))
                : 8192 === (c.mode & 61440) &&
                  ((c.pa = H.Da.jb.node), (c.qa = H.Da.jb.stream));
          c.atime = c.mtime = c.ctime = Date.now();
          a && ((a.ra[b] = c), (a.atime = a.mtime = a.ctime = c.atime));
          return c;
        },
        hc(a) {
          return a.ra
            ? a.ra.subarray
              ? a.ra.subarray(0, a.ta)
              : new Uint8Array(a.ra)
            : new Uint8Array(0);
        },
        pa: {
          ya(a) {
            var b = {};
            b.dev = 8192 === (a.mode & 61440) ? a.id : 1;
            b.ino = a.id;
            b.mode = a.mode;
            b.nlink = 1;
            b.uid = 0;
            b.gid = 0;
            b.rdev = a.rdev;
            J(a.mode)
              ? (b.size = 4096)
              : G.isFile(a.mode)
                ? (b.size = a.ta)
                : 40960 === (a.mode & 61440)
                  ? (b.size = a.link.length)
                  : (b.size = 0);
            b.atime = new Date(a.atime);
            b.mtime = new Date(a.mtime);
            b.ctime = new Date(a.ctime);
            b.Fa = 4096;
            b.blocks = Math.ceil(b.size / b.Fa);
            return b;
          },
          ua(a, b) {
            for (var c of ['mode', 'atime', 'mtime', 'ctime'])
              b[c] && (a[c] = b[c]);
            void 0 !== b.size &&
              ((b = b.size),
              a.ta != b &&
                (0 == b
                  ? ((a.ra = null), (a.ta = 0))
                  : ((c = a.ra),
                    (a.ra = new Uint8Array(b)),
                    c && a.ra.set(c.subarray(0, Math.min(b, a.ta))),
                    (a.ta = b))));
          },
          lookup() {
            throw H.mb;
          },
          Aa(a, b, c, d) {
            return H.createNode(a, b, c, d);
          },
          rename(a, b, c) {
            try {
              var d = M(b, c);
            } catch (g) {}
            if (d) {
              if (J(a.mode)) for (var e in d.ra) throw new G.oa(55);
              kb(d);
            }
            delete a.parent.ra[a.name];
            b.ra[c] = a;
            a.name = c;
            b.ctime = b.mtime = a.parent.ctime = a.parent.mtime = Date.now();
          },
          unlink(a, b) {
            delete a.ra[b];
            a.ctime = a.mtime = Date.now();
          },
          rmdir(a, b) {
            var c = M(a, b),
              d;
            for (d in c.ra) throw new G.oa(55);
            delete a.ra[b];
            a.ctime = a.mtime = Date.now();
          },
          readdir(a) {
            return ['.', '..', ...Object.keys(a.ra)];
          },
          symlink(a, b, c) {
            a = H.createNode(a, b, 41471, 0);
            a.link = c;
            return a;
          },
          readlink(a) {
            if (40960 !== (a.mode & 61440)) throw new G.oa(28);
            return a.link;
          },
        },
        qa: {
          read(a, b, c, d, e) {
            var g = a.node.ra;
            if (e >= a.node.ta) return 0;
            a = Math.min(a.node.ta - e, d);
            if (8 < a && g.subarray) b.set(g.subarray(e, e + a), c);
            else for (d = 0; d < a; d++) b[c + d] = g[e + d];
            return a;
          },
          write(a, b, c, d, e, g) {
            b.buffer === u.buffer && (g = !1);
            if (!d) return 0;
            a = a.node;
            a.mtime = a.ctime = Date.now();
            if (b.subarray && (!a.ra || a.ra.subarray)) {
              if (g) return ((a.ra = b.subarray(c, c + d)), (a.ta = d));
              if (0 === a.ta && 0 === e)
                return ((a.ra = b.slice(c, c + d)), (a.ta = d));
              if (e + d <= a.ta) return (a.ra.set(b.subarray(c, c + d), e), d);
            }
            jb(a, e + d);
            if (a.ra.subarray && b.subarray) a.ra.set(b.subarray(c, c + d), e);
            else for (g = 0; g < d; g++) a.ra[e + g] = b[c + g];
            a.ta = Math.max(a.ta, e + d);
            return d;
          },
          va(a, b, c) {
            1 === c
              ? (b += a.position)
              : 2 === c && G.isFile(a.node.mode) && (b += a.node.ta);
            if (0 > b) throw new G.oa(28);
            return b;
          },
          Oa(a, b, c) {
            jb(a.node, b + c);
            a.node.ta = Math.max(a.node.ta, b + c);
          },
          Ia(a, b, c, d, e) {
            if (!G.isFile(a.node.mode)) throw new G.oa(43);
            a = a.node.ra;
            if (e & 2 || !a || a.buffer !== u.buffer) {
              d = !0;
              A();
              e = void 0;
              if (!e) throw new G.oa(48);
              if (a) {
                if (0 < c || c + b < a.length)
                  a.subarray
                    ? (a = a.subarray(c, c + b))
                    : (a = Array.prototype.slice.call(a, c, c + b));
                u.set(a, e);
              }
            } else ((d = !1), (e = a.byteOffset));
            return { wa: e, Ab: d };
          },
          La(a, b, c, d) {
            H.qa.write(a, b, 0, d, c, !1);
            return 0;
          },
        },
      },
      lb = async (a) => {
        a = await la(a);
        return new Uint8Array(a);
      },
      mb = [],
      nb = (a, b, c, d) => {
        'undefined' != typeof Browser && Browser.Pa();
        var e = !1;
        mb.forEach((g) => {
          !e && g.canHandle(b) && (g.handle(a, b, c, d), (e = !0));
        });
        return e;
      },
      ob = (a, b) => {
        var c = 0;
        a && (c |= 365);
        b && (c |= 146);
        return c;
      },
      pb = {
        EPERM: 63,
        ENOENT: 44,
        ESRCH: 71,
        EINTR: 27,
        EIO: 29,
        ENXIO: 60,
        E2BIG: 1,
        ENOEXEC: 45,
        EBADF: 8,
        ECHILD: 12,
        EAGAIN: 6,
        EWOULDBLOCK: 6,
        ENOMEM: 48,
        EACCES: 2,
        EFAULT: 21,
        ENOTBLK: 105,
        EBUSY: 10,
        EEXIST: 20,
        EXDEV: 75,
        ENODEV: 43,
        ENOTDIR: 54,
        EISDIR: 31,
        EINVAL: 28,
        ENFILE: 41,
        EMFILE: 33,
        ENOTTY: 59,
        ETXTBSY: 74,
        EFBIG: 22,
        ENOSPC: 51,
        ESPIPE: 70,
        EROFS: 69,
        EMLINK: 34,
        EPIPE: 64,
        EDOM: 18,
        ERANGE: 68,
        ENOMSG: 49,
        EIDRM: 24,
        ECHRNG: 106,
        EL2NSYNC: 156,
        EL3HLT: 107,
        EL3RST: 108,
        ELNRNG: 109,
        EUNATCH: 110,
        ENOCSI: 111,
        EL2HLT: 112,
        EDEADLK: 16,
        ENOLCK: 46,
        EBADE: 113,
        EBADR: 114,
        EXFULL: 115,
        ENOANO: 104,
        EBADRQC: 103,
        EBADSLT: 102,
        EDEADLOCK: 16,
        EBFONT: 101,
        ENOSTR: 100,
        ENODATA: 116,
        ETIME: 117,
        ENOSR: 118,
        ENONET: 119,
        ENOPKG: 120,
        EREMOTE: 121,
        ENOLINK: 47,
        EADV: 122,
        ESRMNT: 123,
        ECOMM: 124,
        EPROTO: 65,
        EMULTIHOP: 36,
        EDOTDOT: 125,
        EBADMSG: 9,
        ENOTUNIQ: 126,
        EBADFD: 127,
        EREMCHG: 128,
        ELIBACC: 129,
        ELIBBAD: 130,
        ELIBSCN: 131,
        ELIBMAX: 132,
        ELIBEXEC: 133,
        ENOSYS: 52,
        ENOTEMPTY: 55,
        ENAMETOOLONG: 37,
        ELOOP: 32,
        EOPNOTSUPP: 138,
        EPFNOSUPPORT: 139,
        ECONNRESET: 15,
        ENOBUFS: 42,
        EAFNOSUPPORT: 5,
        EPROTOTYPE: 67,
        ENOTSOCK: 57,
        ENOPROTOOPT: 50,
        ESHUTDOWN: 140,
        ECONNREFUSED: 14,
        EADDRINUSE: 3,
        ECONNABORTED: 13,
        ENETUNREACH: 40,
        ENETDOWN: 38,
        ETIMEDOUT: 73,
        EHOSTDOWN: 142,
        EHOSTUNREACH: 23,
        EINPROGRESS: 26,
        EALREADY: 7,
        EDESTADDRREQ: 17,
        EMSGSIZE: 35,
        EPROTONOSUPPORT: 66,
        ESOCKTNOSUPPORT: 137,
        EADDRNOTAVAIL: 4,
        ENETRESET: 39,
        EISCONN: 30,
        ENOTCONN: 53,
        ETOOMANYREFS: 141,
        EUSERS: 136,
        EDQUOT: 19,
        ESTALE: 72,
        ENOTSUP: 138,
        ENOMEDIUM: 148,
        EILSEQ: 25,
        EOVERFLOW: 61,
        ECANCELED: 11,
        ENOTRECOVERABLE: 56,
        EOWNERDEAD: 62,
        ESTRPIPE: 135,
      };
    function N(a) {
      try {
        return a();
      } catch (b) {
        if (!b.code) throw b;
        if ('UNKNOWN' === b.code) throw new G.oa(28);
        throw new G.oa(pb[b.code]);
      }
    }
    function qb(a) {
      return N(() => {
        var b = fs.lstatSync(a).mode;
        P.Ta && (b |= (b & 292) >> 2);
        return b;
      });
    }
    function Q(a) {
      for (var b = []; a.parent !== a; ) (b.push(a.name), (a = a.parent));
      b.push(a.sa.Ma.root);
      b.reverse();
      return Ua(...b);
    }
    var P = {
        Ta: !1,
        ib() {
          P.Ta = !!process.platform.match(/^win/);
          var a = process.binding('constants');
          a.fs && (a = a.fs);
          P.ob = {
            1024: a.O_APPEND,
            64: a.O_CREAT,
            128: a.O_EXCL,
            256: a.O_NOCTTY,
            0: a.O_RDONLY,
            2: a.O_RDWR,
            4096: a.O_SYNC,
            512: a.O_TRUNC,
            1: a.O_WRONLY,
            131072: a.O_NOFOLLOW,
          };
        },
        sa(a) {
          return P.createNode(null, '/', qb(a.Ma.root), 0);
        },
        createNode(a, b, c) {
          if (!J(c) && !G.isFile(c) && 40960 !== (c & 61440))
            throw new G.oa(28);
          a = G.createNode(a, b, c);
          a.pa = P.pa;
          a.qa = P.qa;
          return a;
        },
        pa: {
          ya(a) {
            var b = Q(a),
              c;
            N(() => (c = fs.lstatSync(b)));
            P.Ta &&
              (c.Fa || (c.Fa = 4096),
              c.blocks || (c.blocks = ((c.size + c.Fa - 1) / c.Fa) | 0),
              (c.mode |= (c.mode & 292) >> 2));
            return {
              dev: c.dev,
              ino: c.ino,
              mode: c.mode,
              nlink: c.nlink,
              uid: c.uid,
              gid: c.gid,
              rdev: c.rdev,
              size: c.size,
              atime: c.atime,
              mtime: c.mtime,
              ctime: c.ctime,
              Fa: c.Fa,
              blocks: c.blocks,
            };
          },
          ua(a, b) {
            var c = Q(a);
            N(() => {
              if (void 0 !== b.mode) {
                var d = b.mode;
                P.Ta && (d &= 384);
                fs.chmodSync(c, d);
                a.mode = b.mode;
              }
              void 0 !== b.size && fs.truncateSync(c, b.size);
            });
          },
          lookup(a, b) {
            var c = Q(a);
            c = F(c + '/' + b);
            c = qb(c);
            return P.createNode(a, b, c);
          },
          Aa(a, b, c, d) {
            var e = P.createNode(a, b, c, d),
              g = Q(e);
            N(() => {
              J(e.mode)
                ? fs.mkdirSync(g, e.mode)
                : fs.writeFileSync(g, '', { mode: e.mode });
            });
            return e;
          },
          rename(a, b, c) {
            var d = Q(a),
              e = Va(Q(b), c);
            try {
              G.unlink(e);
            } catch (g) {}
            N(() => fs.renameSync(d, e));
            a.name = c;
          },
          unlink(a, b) {
            var c = Va(Q(a), b);
            N(() => fs.unlinkSync(c));
          },
          rmdir(a, b) {
            var c = Va(Q(a), b);
            N(() => fs.rmdirSync(c));
          },
          readdir(a) {
            var b = Q(a);
            return N(() => fs.readdirSync(b));
          },
          symlink(a, b, c) {
            var d = Va(Q(a), b);
            N(() => fs.symlinkSync(c, d));
          },
          readlink(a) {
            var b = Q(a);
            return N(() => fs.readlinkSync(b));
          },
          hb(a) {
            var b = N(() => fs.mc(a));
            b.Ib = b.Bb;
            return b;
          },
        },
        qa: {
          open(a) {
            var b = Q(a.node);
            N(() => {
              if (G.isFile(a.node.mode)) {
                a.Ka.tb = 1;
                var c = fs,
                  d = c.openSync,
                  e = a.flags;
                e &= -2721793;
                var g = 0,
                  h;
                for (h in P.ob) e & h && ((g |= P.ob[h]), (e ^= h));
                if (e) throw new G.oa(28);
                a.Ra = d.call(c, b, g);
              }
            });
          },
          close(a) {
            N(() => {
              G.isFile(a.node.mode) &&
                a.Ra &&
                0 === --a.Ka.tb &&
                fs.closeSync(a.Ra);
            });
          },
          Fb(a) {
            a.Ka.tb++;
          },
          read(a, b, c, d, e) {
            return 0 === d
              ? 0
              : N(() =>
                  fs.readSync(a.Ra, new Int8Array(b.buffer, c, d), 0, d, e)
                );
          },
          write(a, b, c, d, e) {
            return N(() =>
              fs.writeSync(a.Ra, new Int8Array(b.buffer, c, d), 0, d, e)
            );
          },
          va(a, b, c) {
            var d = b;
            1 === c
              ? (d += a.position)
              : 2 === c &&
                G.isFile(a.node.mode) &&
                N(() => {
                  d += fs.fstatSync(a.Ra).size;
                });
            if (0 > d) throw new G.oa(28);
            return d;
          },
          Ia(a, b, c) {
            if (!G.isFile(a.node.mode)) throw new G.oa(43);
            A();
            P.qa.read(a, u, void 0, b, c);
            return { wa: void 0, Ab: !0 };
          },
          La(a, b, c, d) {
            P.qa.write(a, b, 0, d, c, !1);
            return 0;
          },
        },
      },
      R = {
        Wa: 16895,
        Na: 33279,
        gb: null,
        sa(a) {
          function b(g) {
            g = g.split('/');
            for (var h = d, k = 0; k < g.length - 1; k++) {
              var m = g.slice(0, k + 1).join('/');
              let n, l;
              (n = e)[(l = m)] || (n[l] = R.createNode(h, g[k], R.Wa, 0));
              h = e[m];
            }
            return h;
          }
          function c(g) {
            g = g.split('/');
            return g[g.length - 1];
          }
          ea || A();
          R.gb ?? (R.gb = new FileReaderSync());
          var d = R.createNode(null, '/', R.Wa, 0),
            e = {};
          Array.prototype.forEach.call(a.Ma.files || [], function (g) {
            R.createNode(b(g.name), c(g.name), R.Na, 0, g, g.lastModifiedDate);
          });
          (a.Ma.blobs || []).forEach((g) => {
            R.createNode(b(g.name), c(g.name), R.Na, 0, g.data);
          });
          (a.Ma.packages || []).forEach((g) => {
            g.metadata.files.forEach((h) => {
              var k = h.filename.substr(1);
              R.createNode(b(k), c(k), R.Na, 0, g.blob.slice(h.start, h.end));
            });
          });
          return d;
        },
        createNode(a, b, c, d, e, g) {
          d = G.createNode(a, b, c);
          d.mode = c;
          d.pa = R.pa;
          d.qa = R.qa;
          d.atime = d.mtime = d.ctime = (g || new Date()).getTime();
          R.Na !== R.Wa || A();
          c === R.Na
            ? ((d.size = e.size), (d.ra = e))
            : ((d.size = 4096), (d.ra = {}));
          a && (a.ra[b] = d);
          return d;
        },
        pa: {
          ya(a) {
            return {
              dev: 1,
              ino: a.id,
              mode: a.mode,
              nlink: 1,
              uid: 0,
              gid: 0,
              rdev: 0,
              size: a.size,
              atime: new Date(a.atime),
              mtime: new Date(a.mtime),
              ctime: new Date(a.ctime),
              Fa: 4096,
              blocks: Math.ceil(a.size / 4096),
            };
          },
          ua(a, b) {
            for (const c of ['mode', 'atime', 'mtime', 'ctime'])
              b[c] && (a[c] = b[c]);
          },
          lookup() {
            throw new G.oa(44);
          },
          Aa() {
            throw new G.oa(63);
          },
          rename() {
            throw new G.oa(63);
          },
          unlink() {
            throw new G.oa(63);
          },
          rmdir() {
            throw new G.oa(63);
          },
          readdir(a) {
            var b = ['.', '..'],
              c;
            for (c of Object.keys(a.ra)) b.push(c);
            return b;
          },
          symlink() {
            throw new G.oa(63);
          },
        },
        qa: {
          read(a, b, c, d, e) {
            if (e >= a.node.size) return 0;
            a = a.node.ra.slice(e, e + d);
            d = R.gb.readAsArrayBuffer(a);
            b.set(new Uint8Array(d), c);
            return a.size;
          },
          write() {
            throw new G.oa(29);
          },
          va(a, b, c) {
            1 === c
              ? (b += a.position)
              : 2 === c && G.isFile(a.node.mode) && (b += a.node.size);
            if (0 > b) throw new G.oa(28);
            return b;
          },
        },
      };
    function fb(a, b) {
      G.lb[a] = { qa: b };
    }
    function J(a) {
      return 16384 === (a & 61440);
    }
    function M(a, b) {
      var c = J(a.mode) ? ((c = rb(a, 'x')) ? c : a.pa.lookup ? 0 : 2) : 54;
      if (c) throw new G.oa(c);
      for (c = G.Ca[sb(a.id, b)]; c; c = c.Ja) {
        var d = c.name;
        if (c.parent.id === a.id && d === b) return c;
      }
      return G.lookup(a, b);
    }
    function kb(a) {
      var b = sb(a.parent.id, a.name);
      if (G.Ca[b] === a) G.Ca[b] = a.Ja;
      else
        for (b = G.Ca[b]; b; ) {
          if (b.Ja === a) {
            b.Ja = a.Ja;
            break;
          }
          b = b.Ja;
        }
    }
    function S(a, b = {}) {
      if (!a) return { path: '', node: null };
      b.Sa ?? (b.Sa = !0);
      '/' === a.charAt(0) || (a = G.cwd() + '/' + a);
      var c = 0;
      a: for (; 40 > c; c++) {
        a = a.split('/').filter((k) => !!k && '.' !== k);
        for (var d = G.root, e = '/', g = 0; g < a.length; g++) {
          var h = g === a.length - 1;
          if (h && b.parent) break;
          if ('..' === a[g]) ((e = Ra(e)), (d = d.parent));
          else {
            e = F(e + '/' + a[g]);
            try {
              d = M(d, a[g]);
            } catch (k) {
              if (44 === k?.xa && h && b.Qb) return { path: e };
              throw k;
            }
            !d.Ba || (h && !b.Sa) || (d = d.Ba.root);
            if (40960 === (d.mode & 61440) && (!h || b.za)) {
              if (!d.pa.readlink) throw new G.oa(52);
              d = d.pa.readlink(d);
              '/' === d.charAt(0) || (d = Ra(e) + '/' + d);
              a = d + '/' + a.slice(g + 1).join('/');
              continue a;
            }
          }
        }
        return { path: e, node: d };
      }
      throw new G.oa(32);
    }
    function tb(a) {
      for (var b; ; ) {
        if (G.qb(a))
          return (
            (a = a.sa.rb),
            b ? ('/' !== a[a.length - 1] ? `${a}/${b}` : a + b) : a
          );
        b = b ? `${a.name}/${b}` : a.name;
        a = a.parent;
      }
    }
    function sb(a, b) {
      for (var c = 0, d = 0; d < b.length; d++)
        c = ((c << 5) - c + b.charCodeAt(d)) | 0;
      return ((a + c) >>> 0) % G.Ca.length;
    }
    function ub(a) {
      var b = sb(a.parent.id, a.name);
      a.Ja = G.Ca[b];
      G.Ca[b] = a;
    }
    function vb(a) {
      var b = ['r', 'w', 'rw'][a & 3];
      a & 512 && (b += 'w');
      return b;
    }
    function rb(a, b) {
      if (G.Ya) return 0;
      if (!b.includes('r') || a.mode & 292) {
        if (
          (b.includes('w') && !(a.mode & 146)) ||
          (b.includes('x') && !(a.mode & 73))
        )
          return 2;
      } else return 2;
      return 0;
    }
    function wb(a, b) {
      if (!J(a.mode)) return 54;
      try {
        return (M(a, b), 20);
      } catch (c) {}
      return rb(a, 'wx');
    }
    function xb(a, b, c) {
      try {
        var d = M(a, b);
      } catch (e) {
        return e.xa;
      }
      if ((a = rb(a, 'wx'))) return a;
      if (c) {
        if (!J(d.mode)) return 54;
        if (G.qb(d) || tb(d) === G.cwd()) return 10;
      } else if (J(d.mode)) return 31;
      return 0;
    }
    function U(a) {
      a = G.Kb(a);
      if (!a) throw new G.oa(8);
      return a;
    }
    function yb(a, b = -1) {
      a = Object.assign(new G.yb(), a);
      if (-1 == b)
        a: {
          for (b = 0; b <= G.zb; b++) if (!G.streams[b]) break a;
          throw new G.oa(33);
        }
      a.fd = b;
      return (G.streams[b] = a);
    }
    function zb(a, b = -1) {
      a = yb(a, b);
      a.qa?.Fb?.(a);
      return a;
    }
    function Ab(a) {
      var b = [];
      for (a = [a]; a.length; ) {
        var c = a.pop();
        b.push(c);
        a.push(...c.Qa);
      }
      return b;
    }
    function Bb(a, b, c) {
      'undefined' == typeof c && ((c = b), (b = 438));
      return G.Aa(a, b | 8192, c);
    }
    function Cb() {
      G.mkdir('/dev');
      fb(G.Ha(1, 3), { read: () => 0, write: (d, e, g, h) => h, va: () => 0 });
      Bb('/dev/null', G.Ha(1, 3));
      eb(G.Ha(5, 0), hb);
      eb(G.Ha(6, 0), ib);
      Bb('/dev/tty', G.Ha(5, 0));
      Bb('/dev/tty1', G.Ha(6, 0));
      var a = new Uint8Array(1024),
        b = 0,
        c = () => {
          0 === b && (b = Xa(a).byteLength);
          return a[--b];
        };
      G.Ga('/dev', 'random', c);
      G.Ga('/dev', 'urandom', c);
      G.mkdir('/dev/shm');
      G.mkdir('/dev/shm/tmp');
    }
    function Db() {
      G.mkdir('/proc');
      var a = G.mkdir('/proc/self');
      G.mkdir('/proc/self/fd');
      G.sa(
        {
          sa() {
            var b = G.createNode(a, 'fd', 16895, 73);
            b.qa = { va: H.qa.va };
            b.pa = {
              lookup(c, d) {
                c = +d;
                var e = U(c);
                c = {
                  parent: null,
                  sa: { rb: 'fake' },
                  pa: { readlink: () => e.path },
                  id: c + 1,
                };
                return (c.parent = c);
              },
              readdir() {
                return Array.from(G.streams.entries())
                  .filter(([, c]) => c)
                  .map(([c]) => c.toString());
              },
            };
            return b;
          },
        },
        {},
        '/proc/self/fd'
      );
    }
    function Eb(a, b, c, d) {
      a = 'string' == typeof a ? a : tb(a);
      b = F(a + '/' + b);
      return G.create(b, ob(c, d));
    }
    function Fb(a) {
      if (!(a.Ob || a.Pb || a.link || a.ra)) {
        if ('undefined' != typeof XMLHttpRequest)
          throw Error(
            'Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.'
          );
        try {
          ((a.ra = ma(a.url)), (a.ta = a.ra.length));
        } catch (b) {
          throw new G.oa(29);
        }
      }
    }
    var G = {
      root: null,
      Qa: [],
      lb: {},
      streams: [],
      bb: 1,
      Ca: null,
      kb: '/',
      Za: !1,
      Ya: !0,
      oa: class {
        name = 'ErrnoError';
        constructor(a) {
          this.xa = a;
        }
      },
      Hb: null,
      Va: 0,
      yb: class {
        Ka = {};
        node = null;
        get object() {
          return this.node;
        }
        set object(a) {
          this.node = a;
        }
        get flags() {
          return this.Ka.flags;
        }
        set flags(a) {
          this.Ka.flags = a;
        }
        get position() {
          return this.Ka.position;
        }
        set position(a) {
          this.Ka.position = a;
        }
      },
      xb: class {
        pa = {};
        qa = {};
        Ba = null;
        constructor(a, b, c, d) {
          a ||= this;
          this.parent = a;
          this.sa = a.sa;
          this.id = G.bb++;
          this.name = b;
          this.mode = c;
          this.rdev = d;
          this.atime = this.mtime = this.ctime = Date.now();
        }
        get read() {
          return 365 === (this.mode & 365);
        }
        set read(a) {
          a ? (this.mode |= 365) : (this.mode &= -366);
        }
        get write() {
          return 146 === (this.mode & 146);
        }
        set write(a) {
          a ? (this.mode |= 146) : (this.mode &= -147);
        }
        get Pb() {
          return J(this.mode);
        }
        get Ob() {
          return 8192 === (this.mode & 61440);
        }
      },
      createNode(a, b, c, d) {
        a = new G.xb(a, b, c, d);
        ub(a);
        return a;
      },
      qb(a) {
        return a === a.parent;
      },
      isFile(a) {
        return 32768 === (a & 61440);
      },
      isFIFO(a) {
        return 4096 === (a & 61440);
      },
      isSocket(a) {
        return 49152 === (a & 49152);
      },
      zb: 4096,
      Kb: (a) => G.streams[a],
      Db: {
        open(a) {
          a.qa = G.Jb(a.node.rdev).qa;
          a.qa.open?.(a);
        },
        va() {
          throw new G.oa(70);
        },
      },
      ab: (a) => a >> 8,
      ic: (a) => a & 255,
      Ha: (a, b) => (a << 8) | b,
      Jb: (a) => G.lb[a],
      vb(a, b) {
        function c(h) {
          G.Va--;
          return b(h);
        }
        function d(h) {
          if (h) {
            if (!d.Gb) return ((d.Gb = !0), c(h));
          } else ++g >= e.length && c(null);
        }
        'function' == typeof a && ((b = a), (a = !1));
        G.Va++;
        1 < G.Va &&
          r(
            `warning: ${G.Va} FS.syncfs operations in flight at once, probably just doing extra work`
          );
        var e = Ab(G.root.sa),
          g = 0;
        e.forEach((h) => {
          if (!h.type.vb) return d(null);
          h.type.vb(h, a, d);
        });
      },
      sa(a, b, c) {
        var d = '/' === c;
        if (d && G.root) throw new G.oa(10);
        if (!d && c) {
          var e = S(c, { Sa: !1 });
          c = e.path;
          e = e.node;
          if (e.Ba) throw new G.oa(10);
          if (!J(e.mode)) throw new G.oa(54);
        }
        b = { type: a, Ma: b, rb: c, Qa: [] };
        a = a.sa(b);
        a.sa = b;
        b.root = a;
        d ? (G.root = a) : e && ((e.Ba = b), e.sa && e.sa.Qa.push(b));
        return a;
      },
      Tb(a) {
        a = S(a, { Sa: !1 });
        if (!a.node.Ba) throw new G.oa(28);
        a = a.node;
        var b = a.Ba,
          c = Ab(b);
        Object.keys(G.Ca).forEach((d) => {
          for (d = G.Ca[d]; d; ) {
            var e = d.Ja;
            c.includes(d.sa) && kb(d);
            d = e;
          }
        });
        a.Ba = null;
        a.sa.Qa.splice(a.sa.Qa.indexOf(b), 1);
      },
      lookup(a, b) {
        return a.pa.lookup(a, b);
      },
      Aa(a, b, c) {
        var d = S(a, { parent: !0 }).node;
        a = Sa(a);
        if (!a || '.' === a || '..' === a) throw new G.oa(28);
        var e = wb(d, a);
        if (e) throw new G.oa(e);
        if (!d.pa.Aa) throw new G.oa(63);
        return d.pa.Aa(d, a, b, c);
      },
      hb(a) {
        var b = {
          Bb: 4096,
          Ib: 4096,
          blocks: 1e6,
          Vb: 5e5,
          Ub: 5e5,
          files: G.bb,
          cc: G.bb - 1,
          ec: 42,
          flags: 2,
          kc: 255,
        };
        a = S(a, { za: !0 }).node;
        a?.pa.hb && Object.assign(b, a.pa.hb(a.sa.Ma.root));
        return b;
      },
      create(a, b = 438) {
        return G.Aa(a, (b & 4095) | 32768, 0);
      },
      mkdir(a, b = 511) {
        return G.Aa(a, (b & 1023) | 16384, 0);
      },
      jc(a, b) {
        a = a.split('/');
        for (var c = '', d = 0; d < a.length; ++d)
          if (a[d]) {
            c += '/' + a[d];
            try {
              G.mkdir(c, b);
            } catch (e) {
              if (20 != e.xa) throw e;
            }
          }
      },
      symlink(a, b) {
        if (!Ya(a)) throw new G.oa(44);
        var c = S(b, { parent: !0 }).node;
        if (!c) throw new G.oa(44);
        b = Sa(b);
        var d = wb(c, b);
        if (d) throw new G.oa(d);
        if (!c.pa.symlink) throw new G.oa(63);
        return c.pa.symlink(c, b, a);
      },
      rename(a, b) {
        var c = Ra(a),
          d = Ra(b),
          e = Sa(a),
          g = Sa(b);
        var h = S(a, { parent: !0 });
        var k = h.node;
        h = S(b, { parent: !0 });
        h = h.node;
        if (!k || !h) throw new G.oa(44);
        if (k.sa !== h.sa) throw new G.oa(75);
        var m = M(k, e);
        a = Za(a, d);
        if ('.' !== a.charAt(0)) throw new G.oa(28);
        a = Za(b, c);
        if ('.' !== a.charAt(0)) throw new G.oa(55);
        try {
          var n = M(h, g);
        } catch (l) {}
        if (m !== n) {
          b = J(m.mode);
          if ((e = xb(k, e, b))) throw new G.oa(e);
          if ((e = n ? xb(h, g, b) : wb(h, g))) throw new G.oa(e);
          if (!k.pa.rename) throw new G.oa(63);
          if (m.Ba || (n && n.Ba)) throw new G.oa(10);
          if (h !== k && (e = rb(k, 'w'))) throw new G.oa(e);
          kb(m);
          try {
            (k.pa.rename(m, h, g), (m.parent = h));
          } catch (l) {
            throw l;
          } finally {
            ub(m);
          }
        }
      },
      rmdir(a) {
        var b = S(a, { parent: !0 }).node;
        a = Sa(a);
        var c = M(b, a),
          d = xb(b, a, !0);
        if (d) throw new G.oa(d);
        if (!b.pa.rmdir) throw new G.oa(63);
        if (c.Ba) throw new G.oa(10);
        b.pa.rmdir(b, a);
        kb(c);
      },
      readdir(a) {
        a = S(a, { za: !0 }).node;
        if (!a.pa.readdir) throw new G.oa(54);
        return a.pa.readdir(a);
      },
      unlink(a) {
        var b = S(a, { parent: !0 }).node;
        if (!b) throw new G.oa(44);
        a = Sa(a);
        var c = M(b, a),
          d = xb(b, a, !1);
        if (d) throw new G.oa(d);
        if (!b.pa.unlink) throw new G.oa(63);
        if (c.Ba) throw new G.oa(10);
        b.pa.unlink(b, a);
        kb(c);
      },
      readlink(a) {
        a = S(a).node;
        if (!a) throw new G.oa(44);
        if (!a.pa.readlink) throw new G.oa(28);
        return a.pa.readlink(a);
      },
      stat(a, b) {
        a = S(a, { za: !b }).node;
        if (!a) throw new G.oa(44);
        if (!a.pa.ya) throw new G.oa(63);
        return a.pa.ya(a);
      },
      lstat(a) {
        return G.stat(a, !0);
      },
      chmod(a, b, c) {
        a = 'string' == typeof a ? S(a, { za: !c }).node : a;
        if (!a.pa.ua) throw new G.oa(63);
        a.pa.ua(a, { mode: (b & 4095) | (a.mode & -4096), ctime: Date.now() });
      },
      lchmod(a, b) {
        G.chmod(a, b, !0);
      },
      fchmod(a, b) {
        a = U(a);
        G.chmod(a.node, b);
      },
      chown(a, b, c, d) {
        a = 'string' == typeof a ? S(a, { za: !d }).node : a;
        if (!a.pa.ua) throw new G.oa(63);
        a.pa.ua(a, { timestamp: Date.now() });
      },
      lchown(a, b, c) {
        G.chown(a, b, c, !0);
      },
      fchown(a, b, c) {
        a = U(a);
        G.chown(a.node, b, c);
      },
      truncate(a, b) {
        if (0 > b) throw new G.oa(28);
        a = 'string' == typeof a ? S(a, { za: !0 }).node : a;
        if (!a.pa.ua) throw new G.oa(63);
        if (J(a.mode)) throw new G.oa(31);
        if (!G.isFile(a.mode)) throw new G.oa(28);
        var c = rb(a, 'w');
        if (c) throw new G.oa(c);
        a.pa.ua(a, { size: b, timestamp: Date.now() });
      },
      fc(a, b) {
        a = U(a);
        if (0 === (a.flags & 2097155)) throw new G.oa(28);
        G.truncate(a.node, b);
      },
      oc(a, b, c) {
        a = S(a, { za: !0 }).node;
        a.pa.ua(a, { atime: b, mtime: c });
      },
      open(a, b, c = 438) {
        if ('' === a) throw new G.oa(44);
        if ('string' == typeof b) {
          var d = { r: 0, 'r+': 2, w: 577, 'w+': 578, a: 1089, 'a+': 1090 }[b];
          if ('undefined' == typeof d)
            throw Error(`Unknown file open mode: ${b}`);
          b = d;
        }
        c = b & 64 ? (c & 4095) | 32768 : 0;
        'object' == typeof a
          ? (d = a)
          : ((a = S(a, { za: !(b & 131072), Qb: !0 })),
            (d = a.node),
            (a = a.path));
        var e = !1;
        if (b & 64)
          if (d) {
            if (b & 128) throw new G.oa(20);
          } else ((d = G.Aa(a, c, 0)), (e = !0));
        if (!d) throw new G.oa(44);
        8192 === (d.mode & 61440) && (b &= -513);
        if (b & 65536 && !J(d.mode)) throw new G.oa(54);
        if (
          !e &&
          (c = d
            ? 40960 === (d.mode & 61440)
              ? 32
              : J(d.mode) && ('r' !== vb(b) || b & 512)
                ? 31
                : rb(d, vb(b))
            : 44)
        )
          throw new G.oa(c);
        b & 512 && !e && G.truncate(d, 0);
        b &= -131713;
        b = yb({
          node: d,
          path: tb(d),
          flags: b,
          seekable: !0,
          position: 0,
          qa: d.qa,
          Sb: [],
          error: !1,
        });
        b.qa.open && b.qa.open(b);
        return b;
      },
      close(a) {
        if (null === a.fd) throw new G.oa(8);
        a.Xa && (a.Xa = null);
        try {
          a.qa.close && a.qa.close(a);
        } catch (b) {
          throw b;
        } finally {
          G.streams[a.fd] = null;
        }
        a.fd = null;
      },
      va(a, b, c) {
        if (null === a.fd) throw new G.oa(8);
        if (!a.seekable || !a.qa.va) throw new G.oa(70);
        if (0 != c && 1 != c && 2 != c) throw new G.oa(28);
        a.position = a.qa.va(a, b, c);
        a.Sb = [];
        return a.position;
      },
      read(a, b, c, d, e) {
        if (0 > d || 0 > e) throw new G.oa(28);
        if (null === a.fd) throw new G.oa(8);
        if (1 === (a.flags & 2097155)) throw new G.oa(8);
        if (J(a.node.mode)) throw new G.oa(31);
        if (!a.qa.read) throw new G.oa(28);
        var g = 'undefined' != typeof e;
        if (!g) e = a.position;
        else if (!a.seekable) throw new G.oa(70);
        b = a.qa.read(a, b, c, d, e);
        g || (a.position += b);
        return b;
      },
      write(a, b, c, d, e, g) {
        if (0 > d || 0 > e) throw new G.oa(28);
        if (null === a.fd) throw new G.oa(8);
        if (0 === (a.flags & 2097155)) throw new G.oa(8);
        if (J(a.node.mode)) throw new G.oa(31);
        if (!a.qa.write) throw new G.oa(28);
        a.seekable && a.flags & 1024 && G.va(a, 0, 2);
        var h = 'undefined' != typeof e;
        if (!h) e = a.position;
        else if (!a.seekable) throw new G.oa(70);
        b = a.qa.write(a, b, c, d, e, g);
        h || (a.position += b);
        return b;
      },
      Oa(a, b, c) {
        if (null === a.fd) throw new G.oa(8);
        if (0 > b || 0 >= c) throw new G.oa(28);
        if (0 === (a.flags & 2097155)) throw new G.oa(8);
        if (!G.isFile(a.node.mode) && !J(a.node.mode)) throw new G.oa(43);
        if (!a.qa.Oa) throw new G.oa(138);
        a.qa.Oa(a, b, c);
      },
      Ia(a, b, c, d, e) {
        if (0 !== (d & 2) && 0 === (e & 2) && 2 !== (a.flags & 2097155))
          throw new G.oa(2);
        if (1 === (a.flags & 2097155)) throw new G.oa(2);
        if (!a.qa.Ia) throw new G.oa(43);
        if (!b) throw new G.oa(28);
        return a.qa.Ia(a, b, c, d, e);
      },
      La(a, b, c, d, e) {
        return a.qa.La ? a.qa.La(a, b, c, d, e) : 0;
      },
      $a(a, b, c) {
        if (!a.qa.$a) throw new G.oa(59);
        return a.qa.$a(a, b, c);
      },
      readFile(a, b = {}) {
        b.flags = b.flags || 0;
        b.encoding = b.encoding || 'binary';
        if ('utf8' !== b.encoding && 'binary' !== b.encoding)
          throw Error(`Invalid encoding type "${b.encoding}"`);
        var c,
          d = G.open(a, b.flags);
        a = G.stat(a).size;
        var e = new Uint8Array(a);
        G.read(d, e, 0, a, 0);
        'utf8' === b.encoding ? (c = B(e)) : 'binary' === b.encoding && (c = e);
        G.close(d);
        return c;
      },
      writeFile(a, b, c = {}) {
        c.flags = c.flags || 577;
        a = G.open(a, c.flags, c.mode);
        if ('string' == typeof b) {
          var d = new Uint8Array(ab(b) + 1);
          b = bb(b, d, 0, d.length);
          G.write(a, d, 0, b, void 0, c.Cb);
        } else if (ArrayBuffer.isView(b))
          G.write(a, b, 0, b.byteLength, void 0, c.Cb);
        else throw Error('Unsupported data type');
        G.close(a);
      },
      cwd: () => G.kb,
      chdir(a) {
        a = S(a, { za: !0 });
        if (null === a.node) throw new G.oa(44);
        if (!J(a.node.mode)) throw new G.oa(54);
        var b = rb(a.node, 'x');
        if (b) throw new G.oa(b);
        G.kb = a.path;
      },
      ib() {
        G.Ca = Array(4096);
        G.sa(H, {}, '/');
        G.mkdir('/tmp');
        G.mkdir('/home');
        G.mkdir('/home/web_user');
        Cb();
        Db();
        G.Hb = { MEMFS: H, NODEFS: P, WORKERFS: R };
      },
      Pa(a, b, c) {
        G.Za = !0;
        a ? G.Ga('/dev', 'stdin', a) : G.symlink('/dev/tty', '/dev/stdin');
        b
          ? G.Ga('/dev', 'stdout', null, b)
          : G.symlink('/dev/tty', '/dev/stdout');
        c
          ? G.Ga('/dev', 'stderr', null, c)
          : G.symlink('/dev/tty1', '/dev/stderr');
        G.open('/dev/stdin', 0);
        G.open('/dev/stdout', 1);
        G.open('/dev/stderr', 1);
      },
      lc() {
        G.Za = !1;
        for (var a = 0; a < G.streams.length; a++) {
          var b = G.streams[a];
          b && G.close(b);
        }
      },
      dc(a, b) {
        try {
          var c = S(a, { za: !b });
          a = c.path;
        } catch (g) {}
        var d = !1,
          e = null;
        try {
          ((c = S(a, { parent: !0 })),
            Sa(a),
            (c = S(a, { za: !b })),
            (d = !0),
            (e = c.node));
        } catch (g) {}
        return d ? e : null;
      },
      ac(a, b) {
        a = 'string' == typeof a ? a : tb(a);
        for (b = b.split('/').reverse(); b.length; ) {
          var c = b.pop();
          if (c) {
            var d = F(a + '/' + c);
            try {
              G.mkdir(d);
            } catch (e) {}
            a = d;
          }
        }
        return d;
      },
      Ga(a, b, c, d) {
        a = Va('string' == typeof a ? a : tb(a), b);
        b = ob(!!c, !!d);
        var e;
        (e = G.Ga).ab ?? (e.ab = 64);
        e = G.Ha(G.Ga.ab++, 0);
        fb(e, {
          open(g) {
            g.seekable = !1;
          },
          close() {
            d?.buffer?.length && d(10);
          },
          read(g, h, k, m) {
            for (var n = 0, l = 0; l < m; l++) {
              try {
                var q = c();
              } catch (C) {
                throw new G.oa(29);
              }
              if (void 0 === q && 0 === n) throw new G.oa(6);
              if (null === q || void 0 === q) break;
              n++;
              h[k + l] = q;
            }
            n && (g.node.atime = Date.now());
            return n;
          },
          write(g, h, k, m) {
            for (var n = 0; n < m; n++)
              try {
                d(h[k + n]);
              } catch (l) {
                throw new G.oa(29);
              }
            m && (g.node.mtime = g.node.ctime = Date.now());
            return n;
          },
        });
        return Bb(a, b, e);
      },
      Eb(a, b, c, d, e) {
        class g {
          fb = !1;
          Ua = [];
          cb = void 0;
          ub = 0;
          sb = 0;
          get(l) {
            if (!(l > this.length - 1 || 0 > l)) {
              var q = l % this.chunkSize;
              return this.cb((l / this.chunkSize) | 0)[q];
            }
          }
          Rb(l) {
            this.cb = l;
          }
          wb() {
            var l = new XMLHttpRequest();
            l.open('HEAD', c, !1);
            l.send(null);
            if (!((200 <= l.status && 300 > l.status) || 304 === l.status))
              throw Error("Couldn't load " + c + '. Status: ' + l.status);
            var q = Number(l.getResponseHeader('Content-length')),
              C,
              I = (C = l.getResponseHeader('Accept-Ranges')) && 'bytes' === C;
            l = (C = l.getResponseHeader('Content-Encoding')) && 'gzip' === C;
            var v = 1048576;
            I || (v = q);
            var t = this;
            t.Rb((K) => {
              var L = K * v,
                T = (K + 1) * v - 1;
              T = Math.min(T, q - 1);
              if ('undefined' == typeof t.Ua[K]) {
                var Ta = t.Ua;
                if (L > T)
                  throw Error(
                    'invalid range (' +
                      L +
                      ', ' +
                      T +
                      ') or no bytes requested!'
                  );
                if (T > q - 1)
                  throw Error(
                    'only ' + q + ' bytes available! programmer error!'
                  );
                var O = new XMLHttpRequest();
                O.open('GET', c, !1);
                q !== v && O.setRequestHeader('Range', 'bytes=' + L + '-' + T);
                O.responseType = 'arraybuffer';
                O.overrideMimeType &&
                  O.overrideMimeType('text/plain; charset=x-user-defined');
                O.send(null);
                if (!((200 <= O.status && 300 > O.status) || 304 === O.status))
                  throw Error("Couldn't load " + c + '. Status: ' + O.status);
                L =
                  void 0 !== O.response
                    ? new Uint8Array(O.response || [])
                    : cb(O.responseText || '');
                Ta[K] = L;
              }
              if ('undefined' == typeof t.Ua[K]) throw Error('doXHR failed!');
              return t.Ua[K];
            });
            if (l || !q)
              ((v = q = 1),
                (v = q = this.cb(0).length),
                oa(
                  'LazyFiles on gzip forces download of the whole file when length is accessed'
                ));
            this.ub = q;
            this.sb = v;
            this.fb = !0;
          }
          get length() {
            this.fb || this.wb();
            return this.ub;
          }
          get chunkSize() {
            this.fb || this.wb();
            return this.sb;
          }
        }
        if ('undefined' != typeof XMLHttpRequest) {
          if (!ea)
            throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var h = new g();
          var k = void 0;
        } else ((k = c), (h = void 0));
        var m = Eb(a, b, d, e);
        h ? (m.ra = h) : k && ((m.ra = null), (m.url = k));
        Object.defineProperties(m, {
          ta: {
            get: function () {
              return this.ra.length;
            },
          },
        });
        var n = {};
        Object.keys(m.qa).forEach((l) => {
          var q = m.qa[l];
          n[l] = (...C) => {
            Fb(m);
            return q(...C);
          };
        });
        n.read = (l, q, C, I, v) => {
          Fb(m);
          l = l.node.ra;
          if (v >= l.length) q = 0;
          else {
            I = Math.min(l.length - v, I);
            if (l.slice) for (var t = 0; t < I; t++) q[C + t] = l[v + t];
            else for (t = 0; t < I; t++) q[C + t] = l.get(v + t);
            q = I;
          }
          return q;
        };
        n.Ia = () => {
          Fb(m);
          A();
          throw new G.oa(48);
        };
        m.qa = n;
        return m;
      },
    };
    function Gb(a, b) {
      if ('/' === b.charAt(0)) return b;
      a = -100 === a ? G.cwd() : U(a).path;
      if (0 == b.length) throw new G.oa(44);
      return a + '/' + b;
    }
    var Pa = void 0,
      Hb = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335],
      Ib = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
      Jb = {},
      Kb = (a) => {
        if (a instanceof Ga || 'unwind' == a) return ra;
        ka(1, a);
      },
      Lb = (a) => {
        ra = a;
        ka(a, new Ga(a));
      },
      Mb = (a) => {
        ra = a;
        Lb(a);
      },
      Nb = (a) => {
        if (!qa)
          try {
            a();
          } catch (b) {
            Kb(b);
          }
      },
      Ob = {},
      Qb = () => {
        if (!Pb) {
          var a = {
              USER: 'web_user',
              LOGNAME: 'web_user',
              PATH: '/',
              PWD: '/',
              HOME: '/home/web_user',
              LANG:
                (
                  ('object' == typeof navigator &&
                    navigator.languages &&
                    navigator.languages[0]) ||
                  'C'
                ).replace('-', '_') + '.UTF-8',
              _: ja || './this.program',
            },
            b;
          for (b in Ob) void 0 === Ob[b] ? delete a[b] : (a[b] = Ob[b]);
          var c = [];
          for (b in a) c.push(`${b}=${a[b]}`);
          Pb = c;
        }
        return Pb;
      },
      Pb,
      V;
    G.bc = (a, b, c, d, e, g, h, k, m, n) => {
      function l(C) {
        function I(v) {
          n?.();
          if (!k) {
            var t = a,
              K = b;
            t &&
              ((t = 'string' == typeof t ? t : tb(t)),
              (K = b ? F(t + '/' + b) : t));
            t = ob(d, e);
            K = G.create(K, t);
            if (v) {
              if ('string' == typeof v) {
                for (var L = Array(v.length), T = 0, Ta = v.length; T < Ta; ++T)
                  L[T] = v.charCodeAt(T);
                v = L;
              }
              G.chmod(K, t | 146);
              L = G.open(K, 577);
              G.write(L, v, 0, v.length, 0, m);
              G.close(L);
              G.chmod(K, t);
            }
          }
          g?.();
          Aa();
        }
        nb(C, q, I, () => {
          h?.();
          Aa();
        }) || I(C);
      }
      var q = b ? Ya(F(a + '/' + b)) : a;
      ya++;
      'string' == typeof c ? lb(c).then(l, h) : l(c);
    };
    G.ib();
    H.mb = new G.oa(44);
    H.mb.stack = '<generic error, no stack>';
    fa && P.ib();
    var pc = {
        o: (a, b, c, d) =>
          A(
            `Assertion failed: ${a ? B(w, a) : ''}, at: ` +
              [
                b ? (b ? B(w, b) : '') : 'unknown filename',
                c,
                d ? (d ? B(w, d) : '') : 'unknown function',
              ]
          ),
        n: (a) => {
          var b = new La(a);
          0 == u[b.wa + 12] && ((u[b.wa + 12] = 1), Ka--);
          u[b.wa + 13] = 0;
          Ja.push(b);
          Rb(a);
          return Sb(a);
        },
        q: () => {
          W(0, 0);
          var a = Ja.pop();
          Tb(a.nb);
          D = 0;
        },
        d: () => Oa([]),
        j: (a) => Oa([a]),
        K: (a, b) => Oa([a, b]),
        B: () => {
          var a = Ja.pop();
          a || A('no exception to throw');
          var b = a.nb;
          0 == u[a.wa + 13] &&
            (Ja.push(a), (u[a.wa + 13] = 1), (u[a.wa + 12] = 0), Ka++);
          D = b;
          throw D;
        },
        a: (a, b, c) => {
          new La(a).Pa(b, c);
          D = a;
          Ka++;
          throw D;
        },
        R: () => Ka,
        g: (a) => {
          D ||= a;
          throw D;
        },
        w: function (a, b, c) {
          Pa = c;
          try {
            var d = U(a);
            switch (b) {
              case 0:
                var e = E();
                if (0 > e) break;
                for (; G.streams[e]; ) e++;
                return zb(d, e).fd;
              case 1:
              case 2:
                return 0;
              case 3:
                return d.flags;
              case 4:
                return ((e = E()), (d.flags |= e), 0);
              case 12:
                return ((e = E()), (sa[(e + 0) >> 1] = 2), 0);
              case 13:
              case 14:
                return 0;
            }
            return -28;
          } catch (g) {
            if ('undefined' == typeof G || 'ErrnoError' !== g.name) throw g;
            return -g.xa;
          }
        },
        D: function (a, b, c) {
          Pa = c;
          try {
            var d = U(a);
            switch (b) {
              case 21509:
                return d.tty ? 0 : -59;
              case 21505:
                if (!d.tty) return -59;
                if (d.tty.Ea.Lb) {
                  a = [
                    3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                  ];
                  var e = E();
                  x[e >> 2] = 25856;
                  x[(e + 4) >> 2] = 5;
                  x[(e + 8) >> 2] = 191;
                  x[(e + 12) >> 2] = 35387;
                  for (var g = 0; 32 > g; g++) u[e + g + 17] = a[g] || 0;
                }
                return 0;
              case 21510:
              case 21511:
              case 21512:
                return d.tty ? 0 : -59;
              case 21506:
              case 21507:
              case 21508:
                if (!d.tty) return -59;
                if (d.tty.Ea.Mb)
                  for (e = E(), a = [], g = 0; 32 > g; g++)
                    a.push(u[e + g + 17]);
                return 0;
              case 21519:
                if (!d.tty) return -59;
                e = E();
                return (x[e >> 2] = 0);
              case 21520:
                return d.tty ? -28 : -59;
              case 21531:
                return ((e = E()), G.$a(d, b, e));
              case 21523:
                if (!d.tty) return -59;
                d.tty.Ea.Nb &&
                  ((g = [24, 80]),
                  (e = E()),
                  (sa[e >> 1] = g[0]),
                  (sa[(e + 2) >> 1] = g[1]));
                return 0;
              case 21524:
                return d.tty ? 0 : -59;
              case 21515:
                return d.tty ? 0 : -59;
              default:
                return -28;
            }
          } catch (h) {
            if ('undefined' == typeof G || 'ErrnoError' !== h.name) throw h;
            return -h.xa;
          }
        },
        E: function (a, b, c, d) {
          Pa = d;
          try {
            b = b ? B(w, b) : '';
            b = Gb(a, b);
            var e = d ? E() : 0;
            return G.open(b, c, e).fd;
          } catch (g) {
            if ('undefined' == typeof G || 'ErrnoError' !== g.name) throw g;
            return -g.xa;
          }
        },
        V: function (a, b, c, d) {
          try {
            return (
              (b = b ? B(w, b) : ''),
              (d = d ? B(w, d) : ''),
              (b = Gb(a, b)),
              (d = Gb(c, d)),
              G.rename(b, d),
              0
            );
          } catch (e) {
            if ('undefined' == typeof G || 'ErrnoError' !== e.name) throw e;
            return -e.xa;
          }
        },
        U: function (a, b) {
          try {
            a = a ? B(w, a) : '';
            var c = G.stat,
              d = c(a);
            x[b >> 2] = d.dev;
            x[(b + 4) >> 2] = d.mode;
            y[(b + 8) >> 2] = d.nlink;
            x[(b + 12) >> 2] = d.uid;
            x[(b + 16) >> 2] = d.gid;
            x[(b + 20) >> 2] = d.rdev;
            z[(b + 24) >> 3] = BigInt(d.size);
            x[(b + 32) >> 2] = 4096;
            x[(b + 36) >> 2] = d.blocks;
            var e = d.atime.getTime(),
              g = d.mtime.getTime(),
              h = d.ctime.getTime();
            z[(b + 40) >> 3] = BigInt(Math.floor(e / 1e3));
            y[(b + 48) >> 2] = (e % 1e3) * 1e6;
            z[(b + 56) >> 3] = BigInt(Math.floor(g / 1e3));
            y[(b + 64) >> 2] = (g % 1e3) * 1e6;
            z[(b + 72) >> 3] = BigInt(Math.floor(h / 1e3));
            y[(b + 80) >> 2] = (h % 1e3) * 1e6;
            z[(b + 88) >> 3] = BigInt(d.ino);
            return 0;
          } catch (k) {
            if ('undefined' == typeof G || 'ErrnoError' !== k.name) throw k;
            return -k.xa;
          }
        },
        T: function (a, b, c) {
          try {
            return (
              (b = b ? B(w, b) : ''),
              (b = Gb(a, b)),
              0 === c
                ? G.unlink(b)
                : 512 === c
                  ? G.rmdir(b)
                  : A('Invalid flags passed to unlinkat'),
              0
            );
          } catch (d) {
            if ('undefined' == typeof G || 'ErrnoError' !== d.name) throw d;
            return -d.xa;
          }
        },
        Q: () => A(''),
        O: () => {},
        M: () => {
          throw Infinity;
        },
        W: function (a, b) {
          a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);
          a = new Date(1e3 * a);
          x[b >> 2] = a.getSeconds();
          x[(b + 4) >> 2] = a.getMinutes();
          x[(b + 8) >> 2] = a.getHours();
          x[(b + 12) >> 2] = a.getDate();
          x[(b + 16) >> 2] = a.getMonth();
          x[(b + 20) >> 2] = a.getFullYear() - 1900;
          x[(b + 24) >> 2] = a.getDay();
          var c = a.getFullYear();
          x[(b + 28) >> 2] =
            ((0 !== c % 4 || (0 === c % 100 && 0 !== c % 400) ? Ib : Hb)[
              a.getMonth()
            ] +
              a.getDate() -
              1) |
            0;
          x[(b + 36) >> 2] = -(60 * a.getTimezoneOffset());
          c = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
          var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
          x[(b + 32) >> 2] =
            (c != d && a.getTimezoneOffset() == Math.min(d, c)) | 0;
        },
        P: (a, b) => {
          Jb[a] && (clearTimeout(Jb[a].id), delete Jb[a]);
          if (!b) return 0;
          var c = setTimeout(() => {
            delete Jb[a];
            Nb(() => Ub(a, performance.now()));
          }, b);
          Jb[a] = { id: c, nc: b };
          return 0;
        },
        H: (a, b, c, d) => {
          var e = new Date().getFullYear(),
            g = new Date(e, 0, 1).getTimezoneOffset();
          e = new Date(e, 6, 1).getTimezoneOffset();
          y[a >> 2] = 60 * Math.max(g, e);
          x[b >> 2] = Number(g != e);
          b = (h) => {
            var k = Math.abs(h);
            return `UTC${0 <= h ? '-' : '+'}${String(Math.floor(k / 60)).padStart(2, '0')}${String(k % 60).padStart(2, '0')}`;
          };
          a = b(g);
          b = b(e);
          e < g
            ? (bb(a, w, c, 17), bb(b, w, d, 17))
            : (bb(a, w, d, 17), bb(b, w, c, 17));
        },
        F: () => Date.now(),
        S: (a) => {
          var b = w.length;
          a >>>= 0;
          if (2147483648 < a) return !1;
          for (var c = 1; 4 >= c; c *= 2) {
            var d = b * (1 + 0.2 / c);
            d = Math.min(d, a + 100663296);
            a: {
              d =
                ((Math.min(
                  2147483648,
                  65536 * Math.ceil(Math.max(a, d) / 65536)
                ) -
                  pa.buffer.byteLength +
                  65535) /
                  65536) |
                0;
              try {
                pa.grow(d);
                ta();
                var e = 1;
                break a;
              } catch (g) {}
              e = void 0;
            }
            if (e) return !0;
          }
          return !1;
        },
        Y: (a, b) => {
          var c = 0;
          Qb().forEach((d, e) => {
            var g = b + c;
            e = y[(a + 4 * e) >> 2] = g;
            for (g = 0; g < d.length; ++g) u[e++] = d.charCodeAt(g);
            u[e] = 0;
            c += d.length + 1;
          });
          return 0;
        },
        Z: (a, b) => {
          var c = Qb();
          y[a >> 2] = c.length;
          var d = 0;
          c.forEach((e) => (d += e.length + 1));
          y[b >> 2] = d;
          return 0;
        },
        t: Mb,
        C: function (a) {
          try {
            var b = U(a);
            G.close(b);
            return 0;
          } catch (c) {
            if ('undefined' == typeof G || 'ErrnoError' !== c.name) throw c;
            return c.xa;
          }
        },
        $: function (a, b, c, d) {
          try {
            a: {
              var e = U(a);
              a = b;
              for (var g, h = (b = 0); h < c; h++) {
                var k = y[a >> 2],
                  m = y[(a + 4) >> 2];
                a += 8;
                var n = G.read(e, u, k, m, g);
                if (0 > n) {
                  var l = -1;
                  break a;
                }
                b += n;
                if (n < m) break;
                'undefined' != typeof g && (g += n);
              }
              l = b;
            }
            y[d >> 2] = l;
            return 0;
          } catch (q) {
            if ('undefined' == typeof G || 'ErrnoError' !== q.name) throw q;
            return q.xa;
          }
        },
        X: function (a, b, c, d) {
          b = -9007199254740992 > b || 9007199254740992 < b ? NaN : Number(b);
          try {
            if (isNaN(b)) return 61;
            var e = U(a);
            G.va(e, b, c);
            z[d >> 3] = BigInt(e.position);
            e.Xa && 0 === b && 0 === c && (e.Xa = null);
            return 0;
          } catch (g) {
            if ('undefined' == typeof G || 'ErrnoError' !== g.name) throw g;
            return g.xa;
          }
        },
        _: function (a, b, c, d) {
          try {
            a: {
              var e = U(a);
              a = b;
              for (var g, h = (b = 0); h < c; h++) {
                var k = y[a >> 2],
                  m = y[(a + 4) >> 2];
                a += 8;
                var n = G.write(e, u, k, m, g);
                if (0 > n) {
                  var l = -1;
                  break a;
                }
                b += n;
                if (n < m) break;
                'undefined' != typeof g && (g += n);
              }
              l = b;
            }
            y[d >> 2] = l;
            return 0;
          } catch (q) {
            if ('undefined' == typeof G || 'ErrnoError' !== q.name) throw q;
            return q.xa;
          }
        },
        G: Vb,
        b: Wb,
        c: Xb,
        h: Yb,
        m: Zb,
        J: $b,
        z: ac,
        p: bc,
        x: cc,
        v: dc,
        y: ec,
        I: fc,
        i: gc,
        e: hc,
        f: ic,
        k: jc,
        l: kc,
        L: lc,
        r: mc,
        s: nc,
        u: oc,
        A: (a) => a,
        N: Lb,
      },
      X;
    (async function () {
      ya++;
      var a = { a: pc };
      Ca ??= Ba('qpdf.wasm')
        ? 'qpdf.wasm'
        : f.locateFile
          ? f.locateFile('qpdf.wasm', p)
          : p + 'qpdf.wasm';
      try {
        var b = await Fa(a);
        X = b.instance.exports;
        pa = X.aa;
        ta();
        V = X.da;
        va.unshift(X.ba);
        Aa();
        return b;
      } catch (c) {
        ba(c);
      }
    })();
    var qc = (f._main = (a, b) => (qc = f._main = X.ca)(a, b)),
      Ub = (a, b) => (Ub = X.ea)(a, b),
      W = (a, b) => (W = X.fa)(a, b),
      Ma = (a) => (Ma = X.ga)(a),
      Y = (a) => (Y = X.ha)(a),
      rc = (a) => (rc = X.ia)(a),
      Z = () => (Z = X.ja)(),
      Tb = (a) => (Tb = X.ka)(a),
      Rb = (a) => (Rb = X.la)(a),
      Na = (a, b, c) => (Na = X.ma)(a, b, c),
      Sb = (a) => (Sb = X.na)(a);
    function Xb(a, b, c) {
      var d = Z();
      try {
        return V.get(a)(b, c);
      } catch (e) {
        Y(d);
        if (e !== e + 0) throw e;
        W(1, 0);
      }
    }
    function Wb(a, b) {
      var c = Z();
      try {
        return V.get(a)(b);
      } catch (d) {
        Y(c);
        if (d !== d + 0) throw d;
        W(1, 0);
      }
    }
    function bc(a, b, c, d, e, g, h) {
      var k = Z();
      try {
        return V.get(a)(b, c, d, e, g, h);
      } catch (m) {
        Y(k);
        if (m !== m + 0) throw m;
        W(1, 0);
      }
    }
    function ic(a, b, c) {
      var d = Z();
      try {
        V.get(a)(b, c);
      } catch (e) {
        Y(d);
        if (e !== e + 0) throw e;
        W(1, 0);
      }
    }
    function hc(a, b) {
      var c = Z();
      try {
        V.get(a)(b);
      } catch (d) {
        Y(c);
        if (d !== d + 0) throw d;
        W(1, 0);
      }
    }
    function gc(a) {
      var b = Z();
      try {
        V.get(a)();
      } catch (c) {
        Y(b);
        if (c !== c + 0) throw c;
        W(1, 0);
      }
    }
    function Yb(a, b, c, d) {
      var e = Z();
      try {
        return V.get(a)(b, c, d);
      } catch (g) {
        Y(e);
        if (g !== g + 0) throw g;
        W(1, 0);
      }
    }
    function lc(a, b, c, d, e, g) {
      var h = Z();
      try {
        V.get(a)(b, c, d, e, g);
      } catch (k) {
        Y(h);
        if (k !== k + 0) throw k;
        W(1, 0);
      }
    }
    function jc(a, b, c, d) {
      var e = Z();
      try {
        V.get(a)(b, c, d);
      } catch (g) {
        Y(e);
        if (g !== g + 0) throw g;
        W(1, 0);
      }
    }
    function Zb(a, b, c, d, e) {
      var g = Z();
      try {
        return V.get(a)(b, c, d, e);
      } catch (h) {
        Y(g);
        if (h !== h + 0) throw h;
        W(1, 0);
      }
    }
    function kc(a, b, c, d, e) {
      var g = Z();
      try {
        V.get(a)(b, c, d, e);
      } catch (h) {
        Y(g);
        if (h !== h + 0) throw h;
        W(1, 0);
      }
    }
    function ac(a, b, c, d, e, g) {
      var h = Z();
      try {
        return V.get(a)(b, c, d, e, g);
      } catch (k) {
        Y(h);
        if (k !== k + 0) throw k;
        W(1, 0);
      }
    }
    function ec(a, b, c, d, e, g) {
      var h = Z();
      try {
        return V.get(a)(b, c, d, e, g);
      } catch (k) {
        Y(h);
        if (k !== k + 0) throw k;
        W(1, 0);
      }
    }
    function $b(a, b, c, d, e, g) {
      var h = Z();
      try {
        return V.get(a)(b, c, d, e, g);
      } catch (k) {
        Y(h);
        if (k !== k + 0) throw k;
        W(1, 0);
      }
    }
    function fc(a, b, c) {
      var d = Z();
      try {
        return V.get(a)(b, c);
      } catch (e) {
        Y(d);
        if (e !== e + 0) throw e;
        W(1, 0);
      }
    }
    function cc(a, b, c, d, e, g, h, k) {
      var m = Z();
      try {
        return V.get(a)(b, c, d, e, g, h, k);
      } catch (n) {
        Y(m);
        if (n !== n + 0) throw n;
        W(1, 0);
      }
    }
    function mc(a, b, c, d, e, g, h, k) {
      var m = Z();
      try {
        V.get(a)(b, c, d, e, g, h, k);
      } catch (n) {
        Y(m);
        if (n !== n + 0) throw n;
        W(1, 0);
      }
    }
    function dc(a, b, c, d, e, g, h, k, m, n, l, q) {
      var C = Z();
      try {
        return V.get(a)(b, c, d, e, g, h, k, m, n, l, q);
      } catch (I) {
        Y(C);
        if (I !== I + 0) throw I;
        W(1, 0);
      }
    }
    function nc(a, b, c, d, e, g, h, k, m, n, l) {
      var q = Z();
      try {
        V.get(a)(b, c, d, e, g, h, k, m, n, l);
      } catch (C) {
        Y(q);
        if (C !== C + 0) throw C;
        W(1, 0);
      }
    }
    function oc(a, b, c, d, e, g, h, k, m, n, l, q, C, I, v, t) {
      var K = Z();
      try {
        V.get(a)(b, c, d, e, g, h, k, m, n, l, q, C, I, v, t);
      } catch (L) {
        Y(K);
        if (L !== L + 0) throw L;
        W(1, 0);
      }
    }
    function Vb(a, b, c) {
      var d = Z();
      try {
        return V.get(a)(b, c);
      } catch (e) {
        Y(d);
        if (e !== e + 0) throw e;
        W(1, 0);
      }
    }
    f.callMain = sc;
    f.ENV = Ob;
    f.FS = G;
    f.NODEFS = P;
    f.WORKERFS = R;
    var tc;
    za = function uc() {
      tc || vc();
      tc || (za = uc);
    };
    function sc(a = []) {
      var b = qc;
      a.unshift(ja);
      var c = a.length,
        d = rc(4 * (c + 1)),
        e = d;
      a.forEach((h) => {
        var k = y,
          m = e >> 2,
          n = ab(h) + 1,
          l = rc(n);
        bb(h, w, l, n);
        k[m] = l;
        e += 4;
      });
      y[e >> 2] = 0;
      try {
        var g = b(c, d);
        Mb(g, !0);
        return g;
      } catch (h) {
        return Kb(h);
      }
    }
    function vc() {
      var a = ia;
      if (!(0 < ya)) {
        if (f.preRun)
          for (
            'function' == typeof f.preRun && (f.preRun = [f.preRun]);
            f.preRun.length;
          ) {
            var b = f.preRun.shift();
            ua.unshift(b);
          }
        Ha(ua);
        0 < ya ||
          tc ||
          ((tc = !0),
          (f.calledRun = !0),
          qa ||
            (f.noFSInit || G.Za || G.Pa(),
            (G.Ya = !1),
            Ha(va),
            Ha(wa),
            aa(f),
            wc && sc(a),
            Ha(xa)));
      }
    }
    var wc = !0;
    f.noInitialRun && (wc = !1);
    vc();
    Object.assign(G, {
      init: G.Pa,
      mkdir: G.mkdir,
      mount: G.sa,
      unlink: G.unlink,
      unmount: G.Tb,
      chdir: G.chdir,
      writeFile: G.writeFile,
      readFile: G.readFile,
      createLazyFile: G.Eb,
      setIgnorePermissions: function (a) {
        G.Ya = a;
      },
    });
    moduleRtn = ca;

    return moduleRtn;
  };
})();
if (typeof exports === 'object' && typeof module === 'object') {
  module.exports = Module;
  // This default export looks redundant, but it allows TS to import this
  // commonjs style module.
  module.exports.default = Module;
} else if (typeof define === 'function' && define['amd'])
  define([], () => Module);
