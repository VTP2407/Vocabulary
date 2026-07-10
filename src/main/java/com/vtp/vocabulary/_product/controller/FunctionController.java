package com.vtp.vocabulary._product.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class FunctionController {
    @GetMapping("/check")
    void checkLife(){
        System.out.println("check life");
    }
}
