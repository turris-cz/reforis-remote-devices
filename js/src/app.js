/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import RemoteDevices from "./remoteDevices/RemoteDevices";

const RemoteDevicesPlugin = {
    name: _("Remote Devices"),
    weight: 100,
    path: "/remote-devices",
    submenuId: "remote-devices",
    icon: "server",
    pages: [
        {
            name: "Devices List",
            path: "/devices-list",
            component: RemoteDevices,
        },
    ],
};

ForisPlugins.push(RemoteDevicesPlugin);
