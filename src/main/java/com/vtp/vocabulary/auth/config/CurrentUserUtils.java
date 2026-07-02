package com.vtp.vocabulary.auth.config;

import com.vtp.vocabulary.auth.entity.CustomUserPrincipal;
import com.vtp.vocabulary.enumeration.Role;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class CurrentUserUtils {
    public static CustomUserPrincipal getCurrentUser(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if(authentication == null || !authentication.isAuthenticated()){
            return null;
        }

        Object principal = authentication.getPrincipal();

        if(principal instanceof CustomUserPrincipal customUser){
            return customUser;
        }

        return null;
    }

    public static Long getUserId(){
        CustomUserPrincipal user = getCurrentUser();
        return user!= null ? user.getUserId():null;
    }

    public static String getEmail(){
        CustomUserPrincipal user = getCurrentUser();
        return user!= null ? user.getEmail():null;
    }

    public static Role getRole(){
        CustomUserPrincipal user = getCurrentUser();
        return user!= null ? user.getRole():null;
    }
}
