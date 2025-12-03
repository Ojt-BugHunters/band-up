//package com.project.Band_Up.controllers;
//
//import com.nimbusds.oauth2.sdk.auth.JWTAuthentication;
//import com.project.Band_Up.dtos.webrtc.SignalingMessage;
//import com.project.Band_Up.utils.JwtUserDetails;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.messaging.handler.annotation.MessageMapping;
//import org.springframework.messaging.simp.SimpMessagingTemplate;
//import org.springframework.security.core.annotation.AuthenticationPrincipal;
//import org.springframework.stereotype.Controller;
//
//@Controller
//public class WebRTCSignalingController {
//
//    @Autowired
//    private SimpMessagingTemplate messagingTemplate;
//
//    @MessageMapping("/webrtc.signal")
//    public void signaling(SignalingMessage message, @AuthenticationPrincipal JwtUserDetails userDetails) {
//        message.setSenderId(userDetails.getAccountId());
//        messagingTemplate.convertAndSend(
//                "/topic/room/" + message.getRoomId(),
//                message
//        );
//    }
//}
package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.webrtc.SignalingMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class WebRTCSignalingController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/webrtc.signal")
    public void signaling(SignalingMessage message) {
        // KHÔNG CẦN JWT NỮA - Frontend tự gửi senderId

        System.out.println("================================================");
        System.out.println("📨 Type: " + message.getType());
        System.out.println("👤 SenderId: " + message.getSenderId());
        System.out.println("🏠 RoomId: " + message.getRoomId());
        System.out.println("================================================");

        // Broadcast to room
        messagingTemplate.convertAndSend(
                "/topic/room/" + message.getRoomId(),
                message
        );

        System.out.println("✅ Broadcasted to /topic/room/" + message.getRoomId());
    }
}