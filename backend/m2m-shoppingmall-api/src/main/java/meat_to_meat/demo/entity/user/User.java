package meat_to_meat.demo.entity.user;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import meat_to_meat.demo.dto.user.UserCreateDTO;

import java.time.LocalDate;

@Entity
@Getter
@Table(name = "users")
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class User {

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

    public User(UserCreateDTO userCreateDTO) {
        this.name = userCreateDTO.getUser();
    }

}

