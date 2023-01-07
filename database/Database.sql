DROP SCHEMA IF EXISTS que_database;
CREATE SCHEMA que_database;
USE que_database;



CREATE TABLE Questionnaire(
    questionnaire_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(30) NOT NULL
    
);

CREATE TABLE Q_Session (
	session_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    opened_date DATE NOT NULL,
    submitted VARCHAR(255) NOT NULL,
    questionnaire_id INTEGER NOT NULL,
    
	FOREIGN KEY (questionnaire_id) REFERENCES Questionnaire (questionnaire_id)
);

CREATE TABLE Question (
    question_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    question_text VARCHAR(255) NOT NULL,
    required VARCHAR(255) NOT NULL,
    q_type VARCHAR(255) NOT NULL,
    questionnaire_id INTEGER NOT NULL,
    
    FOREIGN KEY (questionnaire_id) REFERENCES Questionnaire (questionnaire_id)	
);

CREATE TABLE Q_Option (
    option_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    option_text VARCHAR(255) NOT NULL,
    question_id INTEGER NOT NULL,
    
    
    FOREIGN KEY (question_id) REFERENCES Question(question_id)	ON DELETE CASCADE
);


CREATE TABLE Answer(
	answer_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    session_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    option_id INTEGER NOT NULL,
    
    FOREIGN KEY (session_id) REFERENCES Q_Session (session_id)	ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES Question(question_id)	ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES Q_option(option_id)	ON DELETE CASCADE
    
);