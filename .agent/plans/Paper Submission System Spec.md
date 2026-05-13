# **Paper Submission System Spec**

## **Working name**

Possible internal name: **PaperBridge**

Purpose: Turn printable PDF assignments into trackable, scannable, digitally organized student submissions.

The system is designed for teachers who still want students to work on paper, especially for notes, lab sheets, diagrams, truth tables, circuits, code tracing, and written explanations, but who want digital organization, submission tracking, packet completion checking, and eventually question-level review.

## **Core idea**

Teachers upload or create a PDF assignment. The system stamps QR codes onto every page and generates printable packets. Students complete the work on paper or digitally. Submissions are ingested through scanned PDFs or uploaded documents. The system treats submitted pages as opaque page artifacts: it reads the QR codes, identifies the assignment, packet, and page number, sorts pages, checks completeness, and stores the result as a clean submission PDF.

Longer term, PaperBridge can add visible name, period, or ID marking areas and fillable PDF form fields. Form fields can define named answer zones for crop-based review, digital field extraction, and question-level workflows. For MVP 0, these page-overlay and form-zone features are not required.

The PDF is for humans. The QR and packet metadata are for the system. Form field metadata becomes important in later phases.

## **Primary goals**

The system should allow teachers to:

Create or upload a PDF assignment.

Convert common document types to PDF when possible by reusing BentoPDF tooling.

Generate printable versions with QR codes on each page.

Support generic assignment QR mode and anonymous packet QR mode.

Accept scanned PDF submissions from teachers.

Automatically identify assignment, packet, and page number from QR codes.

Put pages in the correct order.

Detect missing pages and duplicate pages.

Display packet identity and completion state.

Generate a clean final PDF submission per packet.

Optionally export processed submissions to a teacher’s Google Drive folder.

Later, use PDF form input boxes as named answer zones.

Later, crop each answer zone for teacher review.

## **MVP 0 scope**

MVP 0 should prove the smallest valuable classroom loop:

Teacher uploads or converts an assignment PDF.

Teacher creates an assignment record with title, page count, and optional class/period label.

Teacher chooses generic QR mode or anonymous packet QR mode.

Teacher generates a printable PDF with QR codes stamped on every page.

The system places QR codes automatically, preferably in a safe corner or margin.

Teacher can manually move the QR placement if automatic placement conflicts with content.

Teacher prints packets and later uploads one or more scanned PDFs.

The system reads QR codes from scanned pages.

The system groups pages by packet when packet IDs are present.

The system reorders pages by page number.

The system reports missing pages, duplicate pages, wrong-assignment pages, and unreadable pages.

The system shows a review table with packet code, pages found, pages missing, completion status, and page previews.

The system generates final per-packet submission PDFs.

The system can optionally export final PDFs and a summary CSV to Google Drive.

### **MVP 0 non-goals**

MVP 0 does not need AcroForm field extraction.

MVP 0 does not need answer-zone crops.

MVP 0 does not need handwriting OCR.

MVP 0 does not need student accounts.

MVP 0 does not need roster integration.

MVP 0 does not need LMS submission or grade passback.

MVP 0 does not need automatic grading.

MVP 0 does not need a full PDF editor.

MVP 0 does not need visible name, period, or ID marking areas.

MVP 0 does not need manual student identification beyond packet code.

MVP 0 does not need live camera scanning.

MVP 0 does not need student phone photo submission, though the QR URL design should leave room for it.

## **Main users**

Teacher: Creates assignments, generates printable packets, uploads scanned stacks, reviews packet completion, and exports to Drive. Manual student labeling can be added after MVP 0.

Student: Completes a paper packet. In MVP 0, the student does not need an account or active interaction with the system.

System: Reads QR codes, validates pages, groups pages, builds final submissions, and stores metadata.

## **Phased roadmap**

### **MVP 0: Packet generation and scan recovery**

Focus on printable packet generation and teacher scanned PDF upload.

Core capabilities:

PDF upload and optional document-to-PDF conversion.

Assignment record creation.

Automatic QR placement with manual adjustment.

Generic assignment QR mode.

Anonymous packet QR mode.

Printable combined packet PDF generation.

Teacher scan upload.

QR reading from scanned pages.

Packet grouping.

Page sorting.

Completeness and duplicate detection.

Final submission PDF generation.

Optional Google Drive export of final PDFs and CSV.

### **Phase 1: Student submission flow**

Add page-overlay plumbing and a separate student-facing frontend for QR-based submission.

Teacher can optionally add visible `Name`, `Period`, or `ID` marking areas during packet generation.

Teacher can manually move visible marking areas in the packet preview UI.

Student scans a QR code on any packet page.

QR URL opens a submission page scoped to the assignment or packet.

Student uploads a PDF or captures page photos.

System validates QR, assignment, packet, and page number.

Interface shows page checklist and retake/replace state.

System builds a final submission PDF when all required pages are accepted, or allows partial submission if configured.

### **Phase 2: Assignment form zones and crops**

Rework the BentoPDF form creator into an assignment creation UI.

Teacher can upload or create a PDF with form fields.

Teacher can mark or rename answer zones.

The system extracts field names, rectangles, page sizes, and field types.

For scanned submissions, the system aligns pages and crops answer zones.

Teacher review UI can show name crops and question crops.

The crop itself is the review artifact. Handwriting OCR remains out of scope.

### **Phase 3: Digital fillable submissions**

Support digitally completed PDFs.

If uploaded PDFs still contain AcroForm values, extract values directly.

If the PDF was flattened or printed to PDF, treat it like a scanned submission.

Show extracted digital values alongside scanned crop artifacts when available.

### **Phase 4: Roster packet mode**

Add roster-aware packet generation.

Each printed packet can be assigned to a specific student.

The system can stamp a visible student name on each page.

QR tokens should still use opaque IDs, not readable personal data.

Roster mode enables makeup work tracking, LMS matching, and later grade workflows.

### **Later phases**

LMS integration.

Grade passback.

Automatic grading.

Advanced question-by-question grading workflows.

Handwriting OCR experimentation.

Live camera edge detection.

## **QR modes**

### **Mode 1: Generic assignment QR**

Every printed copy has the same QR code on each corresponding page.

The QR identifies:

Assignment ID  
Template version  
Page number

This mode is best for note catchers, informal work, lab practice, and situations where the teacher does not need automatic student grouping.

Student identification is handled outside MVP 0. Students may write their names on the page, but MVP 0 treats the scanned page as opaque and does not attempt to extract or classify names.

Example hidden metadata behind the QR token:

{
  "assignmentId": "ex10-relays",
  "templateVersion": 1,
  "pageNumber": 2,
  "packetId": null,
  "studentId": null
}

Advantages:

Very low setup friction.

Teacher can print normally.

No roster needed.

Good for quick classroom use.

Limitations:

If pages from different students are mixed together, the system cannot automatically know which page 2 belongs with which page 1.

Student identity is not automatic.

Best for single-page work or work where manual identification is acceptable.

### **Mode 2: Anonymous packet QR**

Each printed packet has a unique packet ID. Every page in that packet includes the same packet ID plus its page number.

The QR identifies:

Assignment ID  
Template version  
Anonymous packet ID  
Page number

This mode is the recommended MVP 0 default for collected assignments.

Example hidden metadata behind the QR token:

{
  "assignmentId": "ex10-relays",
  "templateVersion": 1,
  "packetId": "7KQ4M",
  "pageNumber": 2,
  "studentId": null
}

Advantages:

No roster required.

Any student can take any packet.

Pages can be scanned out of order.

Pages from multiple students can be mixed together.

The system can group pages by packet ID.

The instructor can identify the student outside the system or in a later manual labeling workflow.

Limitations:

The teacher must generate packet copies through the system.

Printing one large class PDF means packets need to be stapled or separated as they print.

Student names are opaque to the system in MVP 0.

### **Mode 3: Roster packet QR**

Roster mode is a later phase.

Each printed packet is assigned to a specific student. The system can also stamp the student’s visible name on each page.

The QR identifies:

Assignment ID  
Template version  
Packet ID  
Page number  
Student ID or LMS user ID

Example hidden metadata behind the QR token:

{
  "assignmentId": "ex10-relays",
  "templateVersion": 1,
  "packetId": "7KQ4M",
  "pageNumber": 2,
  "studentId": "student_928174"
}

## **QR code design**

Each page should have a QR code.

The QR code should preferably contain a URL, not raw JSON.

Example:

https://bits.mycode.run/p/7KQ4M2

The token resolves server side to the real metadata.

Reasons to use a URL:

A phone scan can open a future submission page.

The same QR works for ingestion and student submission.

The token can stay short.

Student information is not exposed.

Server-side metadata can change without changing the printed structure.

A damaged or old QR can show a helpful fallback page.

The printed page should also include a human-readable fallback near the QR code:

Packet: 7KQ4M  
Page: 2 of 4

For generic assignment mode:

EX10 Relays  
Page: 2 of 4

For roster mode later:

Name: Maya Rodriguez  
Period: 4  
Packet: 7KQ4M  
Page: 2 of 4

## **MVP 0 assignment creation workflow**

Teacher uploads a PDF assignment or converts another document type to PDF.

The system reads:

Page count  
Page sizes  
Existing page rotation  
Basic thumbnail previews

Teacher enters:

Assignment title  
Number of anonymous packets to generate, if using packet mode  

Teacher chooses print mode:

Generic assignment QR  
Anonymous packet QR  
Roster packet QR, later

The system proposes QR placement automatically.

Automatic QR placement should prefer a consistent corner or margin and avoid obvious page content when feasible.

Teacher can manually move QR placement in a preview UI.

The system generates a printable PDF.

In generic mode, it stamps assignment and page QR codes.

In anonymous packet mode, it generates the requested number of packets, each with its own packet ID.

In roster mode later, it generates one packet per rostered student and optionally prints the student name on every page.

## **Later assignment form-zone workflow**

Teacher creates or uploads a fillable PDF using PaperBridge, BentoPDF-derived form creation tools, or another form-capable PDF tool.

The PDF contains visible worksheet content and form fields that mark answer zones.

Each form field should have a meaningful name.

Example field names:

student.name  
student.period  
q01.prediction  
q02.explanation  
q03.truthTable  
reflection.confidence

The system reads:

Page count  
Form field names  
Form field rectangles  
Page sizes  
Optional existing field appearance  
Optional name field location

The system stores a template record based on the PDF form structure.

Example:

{
  "assignmentId": "ex10-relays",
  "templateVersion": 1,
  "title": "EX10 Relays Note Catcher",
  "pageCount": 4,
  "pages": [
    {
      "pageNumber": 1,
      "width": 612,
      "height": 792,
      "fields": [
        {
          "fieldId": "student.name",
          "type": "text",
          "rect": {
            "x": 72,
            "y": 680,
            "width": 240,
            "height": 32
          },
          "purpose": "student_name"
        },
        {
          "fieldId": "q01.prediction",
          "type": "text",
          "rect": {
            "x": 72,
            "y": 430,
            "width": 468,
            "height": 80
          },
          "purpose": "answer"
        }
      ]
    }
  ]
}

This metadata is used later for cropping scanned submissions and extracting digital field values.

## **Submission paths**

### **MVP 0 path: Teacher uploads scanned PDF**

Teacher scans a stack of completed assignments into one or more PDFs.

Teacher selects the assignment and uploads the scanned PDF files.

The system renders or extracts each scanned page as an image.

For each page, the system:

Detects QR code.

Resolves QR token.

Identifies assignment.

Identifies template version.

Identifies packet ID, if present.

Identifies page number.

Checks for duplicate pages.

Groups pages into submissions.

Sorts pages by page number.

Checks for missing pages.

Generates page previews.

Stores enough page data to build final PDFs and support review.

For anonymous packet mode, grouping is automatic by packet ID.

For generic assignment mode, grouping is loose and may require teacher review to assemble or identify submissions.

The system creates a review screen showing:

Submission packet ID  
Detected pages  
Missing pages  
Duplicate pages  
Unreadable pages  
Full page preview  
Status

### **Phase 1 path: Student submits with phone photos**

Student scans the QR code on any page of their packet.

The QR opens a submission page for that assignment or packet.

The student takes a picture of each page or uploads a PDF.

After each photo or upload, the system processes the page.

The system checks:

QR code readable  
Correct assignment  
Correct packet, if in anonymous packet mode  
Page number recognized  
Image not obviously blurry  
Page not already submitted, unless replacing  
Page appears reasonably aligned  
All required pages submitted

The interface shows a simple checklist:

Page 1: Accepted  
Page 2: Missing  
Page 3: Accepted  
Page 4: Needs retake

When all required pages are accepted, the student taps submit.

The system builds a final PDF from the processed images.

### **Phase 3 path: Digital fillable PDF upload**

A student fills the PDF digitally and uploads it.

If the PDF still contains AcroForm field values, the system extracts values directly.

Example extracted result:

{
  "student.name": "Maya Rodriguez",
  "student.period": "4",
  "q01.prediction": "The relay allows a small signal to control a larger circuit.",
  "q02.explanation": "The coil creates a magnetic field that moves the switch."
}

If the PDF was flattened or printed to PDF, the system treats it like a scanned submission and uses visual page processing.

## **Processing outputs**

For each submission, the system should store:

Original uploaded file, optional and temporary  
Original or rendered page images, if needed for review  
Processed page images, if alignment or cleanup is applied  
Final combined PDF  
Submission metadata  
Detected QR results  
Page validation results  
Cropped answer regions, later  
Extracted AcroForm values, later

Example MVP 0 output structure:

EX10 Relays/  
  packet-7KQ4M/  
    submission.pdf  
    metadata.json  
    pages/  
      page-1-preview.jpg  
      page-2-preview.jpg

Example later output structure with answer crops:

EX10 Relays/  
  packet-7KQ4M/  
    submission.pdf  
    metadata.json  
    pages/  
      page-1-original.jpg  
      page-1-processed.png  
      page-2-original.jpg  
      page-2-processed.png  
    crops/  
      student.name.png  
      q01.prediction.png  
      q02.explanation.png

## **Cropping answer zones**

Cropping answer zones is a Phase 2 feature.

The system uses form field rectangles from the original template as crop zones.

For digitally filled PDFs:

Extract field values directly.

For scanned or photographed pages:

Use page image alignment, then map template field rectangles onto the processed page image.

Crop each answer zone.

Store crops as image files.

Display crops in a teacher review UI.

Important note: The system should not attempt handwriting recognition for the first form-zone phase. The crop itself is the review artifact.

## **Alignment and deskewing**

MVP 0 should do only the correction needed to detect QR codes, create useful previews, and generate final PDFs.

Scanned and photographed pages may be rotated, shifted, scaled, or skewed.

The system should attempt basic correction when feasible:

Detect QR code location.

Use QR orientation to rotate the page.

Deskew based on page edges, detected document contour, or existing PDF processing tools.

Scale to template page dimensions when needed.

For MVP 0, perfect geometric alignment is not required because answer-zone crops are not yet required.

For Phase 2, alignment becomes more important because field rectangles must map onto processed page images.

The system should flag pages where confidence is low.

Example warning:

Page 3 accepted, but QR confidence is low. Review the page before exporting.

## **Validation rules**

A page can be accepted if:

The QR code is readable.

The assignment ID matches the current assignment.

The template version is recognized.

The page number is expected.

The packet ID matches the submission session, if applicable.

The image is not obviously unusable.

A page should be rejected or flagged if:

No QR code is found.

The QR code belongs to another assignment.

The page belongs to a different packet.

The page number is duplicated.

The image is too blurry.

The image is too dark.

The full page is not visible.

QR or alignment confidence is too low.

For duplicates, the app should allow replacement.

Example:

Packet 7KQ4M already has page 2. Replace it with this newly detected page?

## **Teacher review dashboard**

The dashboard should show assignments and submissions.

For each assignment:

Number of packets generated  
Number of complete submissions  
Number of incomplete submissions  
Number of pages needing review  
Export status

For each submission:

Packet ID  
Detected pages  
Missing pages  
Duplicate pages  
Unreadable pages  
Final PDF preview  
Question crops, later  
Submission status

Possible statuses:

Incomplete  
Complete  
Needs review  
Exported  
Identified  
Unidentified

For anonymous packet mode, MVP 0 identifies submissions by packet code. Manual student labeling can be added after the opaque page-recovery loop is working.

Example:

Packet 7KQ4M  
Pages found: 1, 2, 3, 4  
Status: Complete

## **Google Drive export**

The system should allow a registered teacher to connect Google Drive.

The teacher can choose an export folder.

The system can create a folder per assignment.

MVP 0 should probably export final PDFs and a summary CSV first.

Example Drive structure:

Paper Submissions/  
  EX10 Relays/  
    Complete/  
      packet-7KQ4M.pdf  
      packet-J82PA.pdf  
    Needs Review/  
      packet-X92KD.pdf  
    Metadata/  
      submissions.csv

A later detailed export option:

Paper Submissions/  
  EX10 Relays/  
    packet-7KQ4M/  
      submission.pdf  
      metadata.json  
      q01.prediction.png  
      q02.explanation.png

Example MVP 0 CSV columns:

assignmentTitle, packetId, status, pagesFound, pagesMissing, submittedAt, driveFileUrl

Later CSV exports can include `studentLabel` once manual labeling, roster mode, or visible name/period/ID marking exists.

## **Server requirements**

If the system only copied BentoPDF’s local processing model, it could be mostly static.

This system requires a backend because it needs:

Teacher accounts, unless MVP 0 is run as a local-only prototype  
Assignment records  
QR token resolution  
Packet generation  
Scan batch records  
Submission records  
Uploaded scanned files  
Processed outputs  
Google Drive OAuth  
Drive export jobs  
Privacy controls and cleanup

The backend data store is still to be decided.

Reasonable early options:

SQLite for a local or single-teacher prototype.

Postgres for a hosted multi-teacher MVP.

Object storage or filesystem storage for uploaded PDFs and generated artifacts.

The server does not necessarily need to permanently store every uploaded original. It can process and then delete originals after export or after a retention period.

## **Possible architecture**

Frontend:

Replacement PaperBridge interface  
Teacher dashboard  
PDF upload and assignment setup  
QR placement preview UI  
Packet generation UI  
Teacher scan upload UI  
Submission review UI  
Separate student submission UI in Phase 1  
Optional BentoPDF utility tools area

Backend:

Node and Express, or Spring Boot if integrating with an existing Java platform  
Database for assignments, packets, submissions, and token metadata  
Temporary file storage for uploads and processing  
Google OAuth and Drive API integration  
PDF processing service or worker queue

Processing tools:

PDF upload and conversion  
PDF stamping for QR codes  
PDF stamping for visible labels, later  
QR code generation  
QR code reading from images  
PDF page rendering  
Image rotation, deskewing, and cleanup  
PDF generation from processed page images  
PDF form field extraction, later  
Image cropping, later

Possible BentoPDF role:

PDF conversion utilities  
PDF form creation and editing, later  
Client-side PDF rendering and manipulation  
QR stamping patterns  
Deskewing ideas or reusable code  
Workflow/dataflow internals for rapid processing prototypes  
Optional exposed PDF utilities

## **Workflow/dataflow prototyping**

The existing workflow builder does not need to be exposed as a teacher-facing feature.

Its control and dataflow model can be useful as a rapid prototyping harness for processing ideas.

Potential PaperBridge prototype nodes:

Assignment PDF Input  
Generate Packet Tokens  
Stamp QR Codes  
Render Submitted Pages  
Detect QR  
Resolve QR Token  
Group Pages By Packet  
Sort Pages  
Check Packet Completion  
Build Submission PDF  
Export Metadata  
Extract Form Zones, later  
Align Page To Template, later  
Crop Answer Zones, later

The teacher-facing product should use normal assignment and submission screens. The node graph is an internal development tool or advanced diagnostic surface, not the primary UX.

## **Data model draft**

### **Assignment**

{
  "id": "assign_123",
  "title": "EX10 Relays Note Catcher",
  "ownerUserId": "user_456",
  "templateVersion": 1,
  "pageCount": 4,
  "classLabel": "Period 4",
  "createdAt": "2026-05-12T19:00:00Z"
}

### **Packet**

{
  "id": "packet_7KQ4M",
  "assignmentId": "assign_123",
  "packetCode": "7KQ4M",
  "studentId": null,
  "mode": "anonymous",
  "createdAt": "2026-05-12T19:10:00Z"
}

### **QR token**

{
  "token": "7KQ4M2",
  "assignmentId": "assign_123",
  "templateVersion": 1,
  "packetId": "packet_7KQ4M",
  "pageNumber": 2,
  "expiresAt": null
}

### **Scan batch**

{
  "id": "scan_batch_789",
  "assignmentId": "assign_123",
  "source": "teacher-upload",
  "status": "processed",
  "createdAt": "2026-05-12T20:15:00Z"
}

### **Submission**

{
  "id": "sub_abc123",
  "assignmentId": "assign_123",
  "packetId": "packet_7KQ4M",
  "status": "complete",
  "source": "teacher-scan",
  "createdAt": "2026-05-12T20:15:00Z",
  "submittedAt": "2026-05-12T20:18:00Z"
}

### **Submission page**

{
  "submissionId": "sub_abc123",
  "scanBatchId": "scan_batch_789",
  "pageNumber": 2,
  "qrFound": true,
  "qrConfidence": 0.96,
  "status": "accepted",
  "originalPagePath": "uploads/scan-001-page-7.png",
  "previewPath": "pages/page-2-preview.jpg"
}

### **Template page, Phase 2**

{
  "assignmentId": "assign_123",
  "templateVersion": 1,
  "pageNumber": 2,
  "width": 612,
  "height": 792,
  "fields": []
}

### **Field zone, Phase 2**

{
  "assignmentId": "assign_123",
  "templateVersion": 1,
  "pageNumber": 2,
  "fieldId": "q02.explanation",
  "fieldType": "text",
  "rect": {
    "x": 72,
    "y": 330,
    "width": 468,
    "height": 90
  }
}

### **Cropped response, Phase 2**

{
  "submissionId": "sub_abc123",
  "fieldId": "q02.explanation",
  "pageNumber": 2,
  "type": "image",
  "imagePath": "crops/q02.explanation.png"
}

### **Digital response value, Phase 3**

{
  "submissionId": "sub_abc123",
  "fieldId": "q02.explanation",
  "type": "text",
  "value": "The coil creates a magnetic field that closes the switch."
}

## **MVP 0 teacher scan upload interface**

Teacher selects assignment.

Teacher uploads scanned PDF files.

System processes pages.

Teacher sees grouped results.

For anonymous packet mode:

Packet 7KQ4M  
Pages found: 1, 2, 3, 4  
Status: Complete

For generic mode:

Assignment pages detected.  
Student grouping required.

Generic mode may need a manual grouping interface, especially for multi-page assignments.

## **Phase 1 student phone interface**

The student interface should be very simple.

Screen 1:

Assignment title  
Packet code, if available  
Instructions  
Button: Capture page  
Button: Upload PDF

Screen 2:

Camera or file capture input  
Message: Make sure the full page and QR code are visible.

Screen 3:

Processing result

Examples:

Page 2 accepted.

This page belongs to a different packet.

QR code not found. Retake the photo with the QR code visible.

Page 3 is already uploaded. Replace it?

Screen 4:

Submission checklist

Page 1: Accepted  
Page 2: Accepted  
Page 3: Missing  
Page 4: Accepted

Screen 5:

Submit confirmation

All pages are accepted. Submit your packet?

## **Key design decisions**

Use anonymous packet IDs as the default serious collection mode.

Use generic assignment QR mode for low-friction note catchers and informal work.

Use QR codes on every page, not just the first page.

Use short opaque URL tokens rather than raw data in QR codes.

Treat names as human-visible labels, not reliable system identity, when name/period/ID marking is added after MVP 0.

Do not make form zones a requirement for MVP 0.

Use AcroForm field rectangles as answer zones in Phase 2.

Do not rely on handwriting OCR for early phases.

Generate final PDFs from recovered pages.

Keep roster mode as a later extension.

Expose BentoPDF-style tools only as an optional secondary use case, not as the main PaperBridge interface.

## **Open questions**

Which backend data store should MVP 0 use?

Should the system require the QR code to be placed in a reserved margin, or can it overlay onto any uploaded PDF?

How good can automatic QR placement be before manual movement is needed?

In Phase 1, should the system add a name/period/ID marking area automatically, or let the teacher opt in?

Should anonymous packet codes be short and human-readable, like `7KQ4M`, or longer and more collision resistant?

Should uploaded originals be deleted immediately after processing, or retained for a limited time?

Should Google Drive export happen automatically after processing, or only when the teacher clicks export?

Should generic mode support multi-page manual grouping in MVP 0, or should anonymous packet mode be required for reliable multi-page grouping?

Should partial submissions be exportable, or should only complete packets be exported by default?

Which QR decoding library or service should be used first for scanned PDFs?

## **Best first prototype**

The first technical prototype should prove the MVP 0 core loop:

Upload a PDF.

Create an assignment.

Stamp a QR code onto every page.

Generate 3 anonymous packet copies.

Print or simulate scanned pages.

Upload a scanned PDF.

Read QR codes.

Group pages by packet ID.

Sort pages by page number.

Detect missing and duplicate pages.

Show a teacher review table.

Generate one final PDF per packet.

Export final PDFs and a CSV locally or to Google Drive if available.

That prototype validates the most important MVP 0 idea: QR-stamped packets can recover, group, reorder, and complete-check paper submissions with minimal teacher setup.

The next prototype should add Phase 2 form zones and answer crops once packet recovery is proven.
