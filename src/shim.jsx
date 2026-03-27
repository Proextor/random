import React from 'react';

// React 19 no longer exposes __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
// but React-Reconciler v0.27 (used by R3F v8) requires it upon module initialization.
const internals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE || {
    ReactCurrentOwner: { current: null },
    ReactCurrentDispatcher: { current: null }
};

if (!React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = internals;
} else if (!React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner) {
    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner = internals.ReactCurrentOwner || { current: null };
}
