package meat_to_meat.demo.dto.auth;

import meat_to_meat.demo.dto.member.MemberResponseDTO;

public record LoginResponseDTO(String accessToken, MemberResponseDTO member) {
}
