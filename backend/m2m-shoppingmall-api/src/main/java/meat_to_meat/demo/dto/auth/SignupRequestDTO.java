package meat_to_meat.demo.dto.auth;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import meat_to_meat.demo.entity.user.Sex;

import java.time.LocalDate;

// POST /auth/signup
@Getter
@NoArgsConstructor
public class SignupRequestDTO {

    @NotBlank(message = "아이디는 필수입니다.")
    @Size(max = 30, message = "아이디는 30자 이하여야 합니다.")
    private String loginId;

    @NotBlank(message = "비밀번호는 필수입니다.")
    @Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다.")
    private String password;

    @NotBlank(message = "이름은 필수입니다.")
    @Size(max = 50, message = "이름은 50자 이하여야 합니다.")
    private String name;

    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "이메일 형식이 올바르지 않습니다.")
    private String email;

    @NotBlank(message = "전화번호는 필수입니다.")
    private String phone;

    @NotNull(message = "성별은 필수입니다.")
    private Sex sex;

    @NotNull(message = "생년월일은 필수입니다.")
    @Past(message = "생년월일이 올바르지 않습니다.")
    private LocalDate birthday;
}
