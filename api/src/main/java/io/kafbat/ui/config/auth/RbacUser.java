package io.kafbat.ui.config.auth;

import java.io.Serializable;
import java.util.Collection;

public interface RbacUser extends Serializable {
  String name();

  Collection<String> groups();

}
