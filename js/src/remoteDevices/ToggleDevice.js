/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import PropTypes from "prop-types";

ToggleDevice.propTypes = {
    controllerID: PropTypes.string.isRequired,
    enabled: PropTypes.bool.isRequired,
    patchDevice: PropTypes.func.isRequired,
};

export default function ToggleDevice({ controllerID, enabled, patchDevice }) {
    const id = `toggle-${controllerID}`;

    return (
        <div className="custom-control custom-switch">
            <input
                type="checkbox"
                className="custom-control-input"
                id={id}
                checked={enabled}
                onChange={() => patchDevice({ enabled: !enabled })}
            />
            <label className="custom-control-label" htmlFor={id}>{enabled ? _("Yes") : _("No")}</label>
        </div>
    );
}
