package meat_to_meat.demo.repository;

import meat_to_meat.demo.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

}
