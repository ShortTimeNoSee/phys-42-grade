# PHYS 42 Grade Calculator

Simple client-side (all data is processed locally on your device) grade calculator for the PHYS 42 (Physics for Scientists & Engineers II) course at Butte College, Fall 2025.

Hosted on GitHub Pages.

Created because the official gradebook (Canvas) does not correctly calculate the final grade according to the class syllabus. This  implements the  grading rules to give an acurate understanding of standing in the course.

The primary discrepancies this calculator solves are:

* Applying the correct weights for Homework (10%), Labs (10%), Quizzes (20%), and Exams/EC (60%).
    * Including the extra credit rule (where 1 EC point = 5 points added to the total exam score pool).
* Automatically dropping the two (2) lowest quiz scores from the quiz average calculation.
* Including homework score.

## Features

* Scores are automatically saved in the browser's `localStorage`.
* You can, however, export your scores to a `.json` file for backup or transfer, and re-import them later.
* Pressing "Enter" in a lab or quiz score field automatically adds a new row for the next assignment.

## How to Use

1.  Homework: Go to Mastering Physics, find your "Mastering Score" percentage, and enter it into the "Homework" field.
2.  Labs & Quizzes: Use the "Add..." button to create rows. Enter your score and the points possible for each assignment. (Labs default to 10 points, quizzes to 20).
3.  Exams & Extra Credit: Enter your scores for each of the three exams and any extra credit points earned.

Your grade is calculated automatically and displayed at the top. All data is saved locally in your browser, so it will be there when you return.
