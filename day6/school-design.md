# School Database — Design Notes

## Tables

### `students`
One row per student.
- `id` — `INTEGER PRIMARY KEY`, auto-numbered unique identifier.
- `name` — `TEXT NOT NULL`, every student must have a name.
- `email` — `TEXT NOT NULL UNIQUE`, no two students may share an email.

### `courses`
One row per course.
- `id` — `INTEGER PRIMARY KEY`.
- `title` — `TEXT NOT NULL`, the human-readable course name.
- `code` — `TEXT NOT NULL UNIQUE`, short code such as `CS101`.

### `enrolments`
The join table recording that a student is enrolled on a course,
together with the grade for that enrolment.
- `student_id` — `INTEGER NOT NULL`, references `students(id)`.
- `course_id`  — `INTEGER NOT NULL`, references `courses(id)`.
- `grade`      — `TEXT`, may be `NULL` until graded.
- `PRIMARY KEY (student_id, course_id)` — composite primary key that
  both identifies each row and prevents the same student enrolling on
  the same course twice.

## Relationships

- **Students → Enrolments** is **one-to-many**: one student has many
  enrolments, each enrolment belongs to exactly one student.
- **Courses → Enrolments** is also **one-to-many**: one course has many
  enrolments, each enrolment is for exactly one course.
- **Students ↔ Courses** is therefore **many-to-many**: a student takes
  many courses, and a course has many students.

A **join table** (`enrolments`) is needed because a relational database
cannot store a many-to-many relationship directly in two tables. The
join table holds one row per (student, course) pair. It also gives us a
natural place to store data that belongs to the *relationship itself* —
here, the `grade` — which belongs to neither the student nor the course
alone.

## Index

I would add:

```sql
CREATE INDEX idx_enrolments_course_id ON enrolments(course_id);