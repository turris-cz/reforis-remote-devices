/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

import { Button, useForm, useClickOutside } from "foris";

import "./EditableName.css";
import SubmitOrDiscard from "./SubmitOrDiscard";

EditableName.propTypes = {
    name: PropTypes.string.isRequired,
    patchDevice: PropTypes.func.isRequired,
};

export default function EditableName({ name, patchDevice }) {
    const [editorEnabled, setEditorEnabled] = useState(false);

    const formRef = useRef(null);
    const inputRef = useRef(null);

    function toggleEdit() {
        setEditorEnabled((wasEnabled) => {
            if (inputRef.current && !wasEnabled) {
                inputRef.current.focus();
            }
            return !wasEnabled;
        });
    }

    const [formState, formChangeHandler, reloadForm] = useForm(validator);
    const formData = formState.data;
    useEffect(() => {
        reloadForm({ name });
    }, [reloadForm, name]);

    const saveChanges = (event) => {
        event.preventDefault();
        setEditorEnabled(false);
        patchDevice({ options: { custom_name: formData.name } });
    };

    const discardChanges = () => {
        setEditorEnabled(false);
        reloadForm(formState.initialData);
    };

    useClickOutside(formRef, discardChanges);

    if (!formData) {
        return null;
    }

    return (
        <form onSubmit={saveChanges} className="editable-name-form" ref={formRef}>
            <div className="editable-name-input-wrapper">
                <input
                    type="text"
                    value={formData.name}
                    maxLength="30"
                    placeholder="Custom name"
                    className={editorEnabled ? "form-control" : "editable-name-input-disabled"}
                    readOnly={!editorEnabled}
                    onChange={formChangeHandler((value) => ({ name: { $set: value } }))}
                    ref={inputRef}
                />
                <SubmitOrDiscard editorEnabled={editorEnabled} onDiscard={discardChanges} />
            </div>
            <Button className="btn-link" onClick={toggleEdit} title={_("Edit name")}>
                <i className="fa fa-edit text-muted" />
            </Button>
        </form>
    );
}

function validator() {
    // Does nothing but must be supplied to useForm and can't be passed as arrow function.
}
