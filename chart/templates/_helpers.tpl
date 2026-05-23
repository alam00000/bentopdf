{{/*
Expand the name of the hiiirepdf
*/}}
{{- define "hiiirepdf.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "hiiirepdf.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "hiiirepdf.labels" -}}
helm.sh/chart: {{ include "hiiirepdf.chart" . }}
{{ include "hiiirepdf.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "hiiirepdf.selectorLabels" -}}
app.kubernetes.io/name: {{ include "hiiirepdf.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
