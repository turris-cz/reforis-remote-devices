/*
 * Copyright (C) 2019-2021 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useState } from "react";
import PropTypes from "prop-types";
import { API_STATE, Spinner, ErrorMessage, formFieldsSize } from "foris";

import DevicesTable from "./DevicesTable";
import {
    useGetDevices,
    useUpdateDevicesOnAdd,
    usePatchDevice,
    useUpdateDevicesOnEdit,
    useDeleteDevice,
    useUpdateDevicesOnDelete,
} from "./hooks";

Devices.propTypes = {
    ws: PropTypes.object.isRequired,
};

export default function Devices({ ws }) {
    const [devices, setDevices] = useState([]);

    const [getState, getDevices] = useGetDevices(setDevices);
    useUpdateDevicesOnAdd(ws, getDevices);

    const [patchState, patchDevice] = usePatchDevice();
    useUpdateDevicesOnEdit(ws, setDevices);

    const [deleteState, deleteDevice] = useDeleteDevice();
    useUpdateDevicesOnDelete(ws, setDevices);

    if (
        getState === API_STATE.INIT ||
        [getState, patchState, deleteState].includes(API_STATE.SENDING)
    ) {
        return <Spinner />;
    }
    if (getState === API_STATE.ERROR) {
        return <ErrorMessage />;
    }
    return (
        <div className={formFieldsSize}>
            <h2>{_("Devices List")}</h2>
            <DevicesTable
                ws={ws}
                devices={devices}
                patchDevice={patchDevice}
                deleteDevice={deleteDevice}
            />
        </div>
    );
}
