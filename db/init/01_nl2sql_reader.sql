-- NL2SQL 전용 읽기 전용 계정 (SELECT만 가능)
-- 테이블은 Spring JPA가 만들기 때문에 DB 단위로 권한을 준다.
-- 비밀번호는 바꿔서 사용할 것
CREATE USER IF NOT EXISTS 'nl2sql_reader'@'%' IDENTIFIED BY 'reader_pw_change_me';
GRANT SELECT ON meat_to_meat.* TO 'nl2sql_reader'@'%';
FLUSH PRIVILEGES;
