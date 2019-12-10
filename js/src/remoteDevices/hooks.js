/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import { useEffect, useState, useCallback } from "react";
import {
    useWSForisModule, useAPIDelete, useAlert, API_STATE, useAPIGet,
} from "foris";

import API_URLs from "API";

export default function useDevices(ws) {
    const [getDevicesResponse, getDevices] = useAPIGet(API_URLs.devices);
    // Initial data fetch
    useEffect(() => {
        getDevices();
    }, [getDevices]);

    const [devices, setDevices] = useState([]);
    // Update devices list on API success
    useEffect(() => {
        if (getDevicesResponse.state === API_STATE.SUCCESS) {
            setDevices(getDevicesResponse.data);
        }
    }, [getDevicesResponse]);

    // Delete devices
    const [deleteDevice, deleteDeviceState] = useDeleteDevice();
    const removeDeviceFromTable = useCallback((controller_id) => {
        setDevices((previousDevices) => {
            const deleteIndex = previousDevices.findIndex(
                (device) => device.controller_id === controller_id,
            );
            previousDevices.splice(deleteIndex, 1);
            return [...previousDevices];
        });
    }, []);

    // Update devices list when necessary
    useUpdateOnAdd(ws, getDevices);
    useUpdateOnDelete(ws, removeDeviceFromTable);

    return [
        devices,
        deleteDevice,
        ignoreDeleteInit(getDevicesResponse.state, deleteDeviceState),
    ];
}

/*
 * Return filtered API states. Ignore INIT state of delete hook to avoid
 * displaying spinner when table is in its initial state.
 */
function ignoreDeleteInit(getState, deleteState) {
    if (deleteState === API_STATE.INIT) {
        return getState;
    }
    return [getState, deleteState];
}

function useDeleteDevice() {
    const [setAlert] = useAlert();

    const [deleteDeviceResponse, deleteDevice] = useAPIDelete(`${API_URLs.devices}`);
    useEffect(() => {
        if (deleteDeviceResponse.state === API_STATE.ERROR) {
            setAlert(deleteDeviceResponse.data);
        }
    }, [deleteDeviceResponse, setAlert]);

    return [deleteDevice, deleteDeviceResponse.state];
}

function useUpdateOnAdd(ws, getDevices) {
    const [addNotification] = useWSForisModule(ws, "subordinates", "add_sub");
    useEffect(() => {
        if (!addNotification) {
            return;
        }
        if (addNotification.controller_id) {
            getDevices();
        }
    }, [addNotification, getDevices]);
}

function useUpdateOnDelete(ws, deleteDevice) {
    const [deleteNotification] = useWSForisModule(ws, "subordinates", "del");
    useEffect(() => {
        if (!deleteNotification) {
            return;
        }
        if (deleteNotification.controller_id) {
            deleteDevice(deleteNotification.controller_id);
        }
    }, [deleteDevice, deleteNotification]);
}
