package io.kafbat.ui.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;

/**
 * Redis session configuration.
 * Uses Spring Boot auto-configuration for reactive Redis sessions.
 * Configure namespace via: SPRING_SESSION_REDIS_NAMESPACE={kafbat}:session
 * The hash tag {kafbat} ensures all session keys go to the same Redis cluster slot.
 */
@Configuration
@ConditionalOnProperty(name = "spring.session.store-type", havingValue = "redis")
public class RedisSessionConfig {
}
