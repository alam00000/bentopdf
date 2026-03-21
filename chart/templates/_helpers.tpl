{{/*
Expand the name of the bentopdf
*/}}
{{- define "bentopdf.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "bentopdf.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "bentopdf.labels" -}}
helm.sh/chart: {{ include "bentopdf.chart" . }}
{{ include "bentopdf.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "bentopdf.selectorLabels" -}}
app.kubernetes.io/name: {{ include "bentopdf.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
