package meat_to_meat.demo.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.auth.LoginRequestDTO;
import meat_to_meat.demo.dto.auth.LoginResponseDTO;
import meat_to_meat.demo.dto.auth.SignupRequestDTO;
import meat_to_meat.demo.dto.member.MemberResponseDTO;
import meat_to_meat.demo.global.config.UrlNames;
import meat_to_meat.demo.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(UrlNames.authBase)
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping(UrlNames.signup)
    public ResponseEntity<MemberResponseDTO> signup(@Valid @RequestBody SignupRequestDTO request) {
        return ResponseEntity.ok(userService.signup(request));
    }

    @PostMapping(UrlNames.login)
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(userService.login(request));
    }

    // MEM-02 로그아웃: 토큰은 서버에 저장하지 않으므로 클라이언트가 토큰을 지우면 끝난다
    @PostMapping(UrlNames.logout)
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build();
    }
}
