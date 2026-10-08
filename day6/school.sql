-- ============================================================
-- Day 6 Assignment: School Database (SQLite playground safe)
-- ============================================================

-- ------------------------------------------------------------
-- 1. CREATE TABLES
-- ------------------------------------------------------------

CREATE TABLE students (
    id    INTEGER PRIMARY KEY,
    name  TEXT    NOT NULL,
    email TEXT    NOT NULL UNIQUE
);

CREATE TABLE courses (
    id    INTEGER PRIMARY KEY,
    title TEXT    NOT NULL,
    code  TEXT    NOT NULL UNIQUE
);

-- Join table. The composite PRIMARY KEY prevents the same
-- student enrolling on the same course twice.
CREATE TABLE enrolments (
    student_id INTEGER NOT NULL,
    course_id  INTEGER NOT NULL,
    grade      TEXT,
    PRIMARY KEY (student_id, course_id)
);

-- ------------------------------------------------------------
-- 2. INSERT SAMPLE DATA
-- ------------------------------------------------------------

INSERT INTO students (name, email) VALUES
    ('Amina Otieno', 'amina@example.com'),
    ('Brian Kamau',  'brian@example.com'),
    ('Carla Mwangi', 'carla@example.com');

INSERT INTO courses (title, code) VALUES
    ('Introduction to Programming', 'CS101'),
    ('Web Foundations',             'WEB110'),
    ('Database Systems',            'DB200');

INSERT INTO enrolments (student_id, course_id, grade) VALUES
    (1, 1, 'A'),
    (1, 2, 'B+'),
    (2, 1, 'B'),
    (2, 3, NULL),
    (3, 2, 'A-');

-- ------------------------------------------------------------
-- 3. THE FIVE QUERIES
-- ------------------------------------------------------------

-- Query 1: All courses for one student (by name).
SELECT courses.title, courses.code, enrolments.grade
FROM   students
JOIN   enrolments ON enrolments.student_id = students.id
JOIN   courses    ON courses.id            = enrolments.course_id
WHERE  students.name = 'Amina Otieno'
ORDER BY courses.title;

-- Query 2: All students on one course.
SELECT students.name, students.email, enrolments.grade
FROM   courses
JOIN   enrolments ON enrolments.course_id = courses.id
JOIN   students   ON students.id          = enrolments.student_id
WHERE  courses.code = 'WEB110'
ORDER BY students.name;

-- Query 3: Number of students per course.
SELECT courses.title,
       courses.code,
       COUNT(enrolments.student_id) AS student_count
FROM   courses
LEFT JOIN enrolments ON enrolments.course_id = courses.id
GROUP BY courses.id
ORDER BY student_count DESC, courses.title;

-- Query 4: Students who have no enrolments.
SELECT students.name, students.email
FROM   students
LEFT JOIN enrolments ON enrolments.student_id = students.id
WHERE  enrolments.student_id IS NULL;

-- Query 5: Update one enrolment's grade.
UPDATE enrolments
SET    grade = 'A'
WHERE  student_id = (SELECT id FROM students WHERE email = 'brian@example.com')
  AND  course_id  = (SELECT id FROM courses  WHERE code  = 'DB200');

-- Confirm the update.
SELECT students.name, courses.code, enrolments.grade
FROM   enrolments
JOIN   students ON students.id = enrolments.student_id
JOIN   courses  ON courses.id  = enrolments.course_id
ORDER BY students.name, courses.code;

-- ------------------------------------------------------------
-- 4. INDEX
-- ------------------------------------------------------------

CREATE INDEX idx_enrolments_course_id ON enrolments(course_id);