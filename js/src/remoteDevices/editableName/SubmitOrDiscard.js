/*
 * Copyright (C) 2019-2023 CZ.NIC z.s.p.o. (https://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";

import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "foris";
import PropTypes from "prop-types";

import "./SubmitOrDiscard.css";

SubmitOrDiscard.propTypes = {
    editorEnabled: PropTypes.bool.isRequired,
    onDiscard: PropTypes.func.isRequired,
};

export default function SubmitOrDiscard({ editorEnabled, onDiscard }) {
    if (!editorEnabled) {
        return null;
    }

    const buttonClass = "btn-sm btn-light shadow-sm mt-1";

    return (
        <div className="submit-or-discard">
            <Button
                type="submit"
                className={`${buttonClass} me-2`}
                title="Save changes"
            >
                <FontAwesomeIcon
                    icon={faCheck}
                    size="xs"
                    className="fa-fw text-success"
                />
            </Button>
            <Button
                className={buttonClass}
                onClick={onDiscard}
                title="Discard changes"
            >
                <FontAwesomeIcon
                    icon={faTimes}
                    size="xs"
                    className="fa-fw text-danger"
                />
            </Button>
        </div>
    );
}
