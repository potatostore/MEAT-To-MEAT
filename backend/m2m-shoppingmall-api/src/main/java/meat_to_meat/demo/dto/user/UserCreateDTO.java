package meat_to_meat.demo.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import meat_to_meat.demo.entity.user.Sex;
import java.time.LocalDate;

@Getter // 💡 이 어노테이션이 있어야 getLoginId(), getName() 등을 자동으로 만들어줍니다.
@NoArgsConstructor
public class UserCreateDTO {
    // 프론트엔드에서 넘어오는 input 값들

    @NotBlank(message = "아이디는 필수입니다.")
    private String loginId;

    @NotBlank(message = "비밀번호는 필수입니다.")
    private String userPw;

    @NotBlank(message = "이름은 필수입니다.")
    private String name; // 변수명을 name으로 했으므로 getName()으로 꺼내게 됩니다.

    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "이메일 형식이 올바르지 않습니다.")
    private String email;

    @NotBlank(message = "전화번호는 필수입니다.")
    private String phoneNumber;

    @NotNull(message = "생년월일은 필수입니다.")
    private LocalDate birthday;

    @NotNull(message = "성별은 필수입니다.")
    private Sex sex;
}