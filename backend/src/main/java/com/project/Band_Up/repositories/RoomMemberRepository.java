package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.RoomMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RoomMemberRepository extends JpaRepository<RoomMember, UUID> {

}
