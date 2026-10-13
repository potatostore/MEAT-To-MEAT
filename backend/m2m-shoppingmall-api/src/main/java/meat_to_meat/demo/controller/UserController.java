package meat_to_meat.demo.controller;

import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.service.UserService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(value = "http://localhost:3000")
@RestController
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;



}