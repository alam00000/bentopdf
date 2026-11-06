{{/*
Expand the name of the pixelpdf
*/}}
{{- define "pixelpdf.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "pixelpdf.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "pixelpdf.labels" -}}
helm.sh/chart: {{ include "pixelpdf.chart" . }}
{{ include "pixelpdf.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "pixelpdf.selectorLabels" -}}
app.kubernetes.io/name: {{ include "pixelpdf.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
