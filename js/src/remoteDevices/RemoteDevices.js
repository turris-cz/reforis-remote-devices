/*
 * Copyright (C) 2019-2021 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import PropTypes from "prop-types";

import AddDeviceForm from "./AddDeviceForm";
import Devices from "./Devices";

RemoteDevices.propTypes = {
    ws: PropTypes.object.isRequired,
};

export default function RemoteDevices({ ws }) {
    return (
        <>
            <h1>{_("Devices")}</h1>
            <p>
                {_(
                    "You can set up other Turris routers to be managed remotely by this device."
                )}
            </p>
            <p>
                {_(
                    'To authorize your router, you will need a token file that can be obtained with the "Remote Access" plugin on the target device.'
                )}
            </p>
            <AddDeviceForm />
            <Devices ws={ws} />
        </>
    );
}
