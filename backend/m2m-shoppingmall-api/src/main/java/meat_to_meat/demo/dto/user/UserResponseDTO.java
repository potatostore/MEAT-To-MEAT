package meat_to_meat.demo.dto.user;

import lombok.Getter;
import meat_to_meat.demo.entity.user.Sex;
import meat_to_meat.demo.entity.user.User;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
public class UserResponseDTO {

    private Long userId;
    private String loginId;
    private String name;
    private String email;
    private String phoneNumber;
    private LocalDate birthday;
    private Sex sex;
    private LocalDateTime createdAt;

    public UserResponseDTO(User user) {
        this.userId = user.getUserId();
        this.loginId = user.getLoginId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.phoneNumber = user.getPhoneNumber();
        this.birthday = user.getBirthday();
        this.sex = user.getSex();
        this.createdAt = user.getCreatedAt();
    }
}