package meat_to_meat.demo.entity.user;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import meat_to_meat.demo.dto.user.UserCreateDTO;
import meat_to_meat.demo.entity.BaseEntity; // BaseEntity 임포트

import java.time.LocalDate;

@Entity
@Getter
@Table(name = "users")
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class User extends BaseEntity { // 상속 추가

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(unique = true)
    @NotBlank
    private String userPw;

    @Column(nullable = false)
    @NotBlank
    private String name;

    @Column(unique = true)
    private LocalDate birthday;

    @Column(unique = true, nullable = false)
    @NotBlank
    private String loginId;

    @Column(unique = true, nullable = false)
    @NotBlank
    private String email;

    @Column(unique = true, nullable = false)
    @NotBlank
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Sex sex;

    // 엔티티를 생성할 때 DTO의 데이터를 꺼내어 필드에 모두 채워줍니다.
    public User(UserCreateDTO dto) {
        this.loginId = dto.getLoginId();
        this.userPw = dto.getUserPw();
        this.name = dto.getName(); // 💡 getUser()가 아니라 getName()을 사용합니다!
        this.email = dto.getEmail();
        this.phoneNumber = dto.getPhoneNumber();
        this.birthday = dto.getBirthday();
        this.sex = dto.getSex();
    }
}