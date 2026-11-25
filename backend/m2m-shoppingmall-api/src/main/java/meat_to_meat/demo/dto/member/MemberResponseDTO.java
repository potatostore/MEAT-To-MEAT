package meat_to_meat.demo.dto.member;

import meat_to_meat.demo.entity.user.Sex;
import meat_to_meat.demo.entity.user.User;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record MemberResponseDTO(
        Long id,
        String loginId,
        String name,
        String email,
        String phone,
        Sex sex,
        LocalDate birthday,
        LocalDateTime createdAt
) {
    public static MemberResponseDTO from(User user) {
        return new MemberResponseDTO(user.getUserId(), user.getLoginId(), user.getName(), user.getEmail(),
                user.getPhoneNumber(), user.getSex(), user.getBirthday(), user.getCreateAt());
    }
}
