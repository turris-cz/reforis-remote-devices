/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import { useEffect, useCallback } from "react";
import {
    useWSForisModule,
    useAPIDelete,
    useAlert,
    API_STATE,
    useAPIGet,
    useAPIPatch,
} from "foris";

import API_URLs from "API";

export function useGetDevices(setDevices) {
    const [getDevicesResponse, getDevices] = useAPIGet(API_URLs.devices);

    // Initial data fetch
    useEffect(() => {
        getDevices();
    }, [getDevices]);

    // Update devices data
    useEffect(() => {
        if (getDevicesResponse.state === API_STATE.SUCCESS) {
            setDevices(getDevicesResponse.data);
        }
    }, [getDevicesResponse, setDevices]);

    return [getDevicesResponse.state, getDevices];
}

export function useUpdateDevicesOnAdd(ws, getDevices) {
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

export function usePatchDevice() {
    const [setAlert] = useAlert();

    // Handle API request
    const [patchDeviceResponse, patchDevice] = useAPIPatch(
        `${API_URLs.devices}`
    );
    useEffect(() => {
        if (patchDeviceResponse.state === API_STATE.ERROR) {
            setAlert(patchDeviceResponse.data);
        }
    }, [patchDeviceResponse, setAlert]);

    return [patchDeviceResponse.state, patchDevice];
}

export function useUpdateDevicesOnEdit(ws, setDevices) {
    // Update devices data
    const editDevice = useCallback(
        (controller_id, { options, enabled }) => {
            setDevices((previousDevices) => {
                const devices = [...previousDevices];
                const editIndex = devices.findIndex(
                    (device) => device.controller_id === controller_id
                );
                if (editIndex !== -1) {
                    const device = { ...devices[editIndex] };
                    if (options) {
                        device.options = options;
                    }
                    if (enabled !== undefined) {
                        // because "enabled" is boolean
                        device.enabled = enabled;
                    }
                    devices[editIndex] = device;
                }
                return devices;
            });
        },
        [setDevices]
    );

    const [updateNotification] = useWSForisModule(
        ws,
        "subordinates",
        "update_sub"
    );
    useEffect(() => {
        if (!updateNotification) {
            return;
        }
        if (updateNotification.controller_id) {
            editDevice(updateNotification.controller_id, {
                options: updateNotification.options,
            });
        }
    }, [editDevice, updateNotification]);

    const [enabledNotification] = useWSForisModule(
        ws,
        "subordinates",
        "set_enabled"
    );
    useEffect(() => {
        if (!enabledNotification) {
            return;
        }
        if (enabledNotification.controller_id) {
            editDevice(enabledNotification.controller_id, {
                enabled: enabledNotification.enabled,
            });
        }
    }, [editDevice, enabledNotification]);
}

export function useDeleteDevice() {
    const [setAlert] = useAlert();

    // Handle API request
    const [deleteDeviceResponse, deleteDevice] = useAPIDelete(
        `${API_URLs.devices}`
    );
    useEffect(() => {
        if (deleteDeviceResponse.state === API_STATE.ERROR) {
            setAlert(deleteDeviceResponse.data);
        }
    }, [deleteDeviceResponse, setAlert]);

    return [deleteDeviceResponse.state, deleteDevice];
}

export function useUpdateDevicesOnDelete(ws, setDevices) {
    const [deleteNotification] = useWSForisModule(ws, "subordinates", "del");

    // Update devices data
    const removeDeviceFromTable = useCallback(
        (controller_id) => {
            setDevices((previousDevices) => {
                const devices = [...previousDevices];
                const deleteIndex = devices.findIndex(
                    (device) => device.controller_id === controller_id
                );
                if (deleteIndex !== -1) {
                    devices.splice(deleteIndex, 1);
                }
                return devices;
            });
        },
        [setDevices]
    );

    useEffect(() => {
        if (!deleteNotification) {
            return;
        }
        if (deleteNotification.controller_id) {
            removeDeviceFromTable(deleteNotification.controller_id);
        }
    }, [removeDeviceFromTable, deleteNotification]);
}
