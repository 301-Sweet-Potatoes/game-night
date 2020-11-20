DROP TABLE IF EXISTS trivia;

CREATE TABLE trivia (
  id SERIAL PRIMARY KEY,
  category VARCHAR(500),
  question VARCHAR(500),
  correctanswer VARCHAR(500)
)