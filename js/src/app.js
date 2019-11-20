/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import RemoteDevices from "./remote_devices/RemoteDevices";

const RemoteDevicesPlugin = {
    name: _("Remote Devices"),
    submenuId: "administration",
    weight: 100,
    path: "/remote-devices",
    component: RemoteDevices,
};

ForisPlugins.push(RemoteDevicesPlugin);
