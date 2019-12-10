/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import PropTypes from "prop-types";

import useDevices from "./hooks";
import DevicesTable from "./DevicesTable";

Devices.propTypes = {
    ws: PropTypes.object.isRequired,
};

export default function Devices({ ws }) {
    const [devices, deleteDevice, apiState] = useDevices(ws);

    return (
        <>
            <h3>{_("Devices")}</h3>
            <DevicesTable
                apiState={apiState}
                devices={devices}
                onDelete={deleteDevice}
            />
        </>
    );
}
