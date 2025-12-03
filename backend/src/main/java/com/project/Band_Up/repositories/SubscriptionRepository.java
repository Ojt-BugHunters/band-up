package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.Subscriptions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscriptions, UUID> {
}
