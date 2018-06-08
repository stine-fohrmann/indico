/* This file is part of Indico.
* Copyright (C) 2002 - 2018 European Organization for Nuclear Research (CERN).
*
* Indico is free software; you can redistribute it and/or
* modify it under the terms of the GNU General Public License as
* published by the Free Software Foundation; either version 3 of the
* License, or (at your option) any later version.
*
* Indico is distributed in the hope that it will be useful, but
* WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
* General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Indico; if not, see <http://www.gnu.org/licenses/>.
*/

import React from 'react';
import {Button, Icon, Popup} from 'semantic-ui-react';
import PropTypes from 'prop-types';

import './FilterDropdown.module.scss';


function _mergeDefaults(defaults, values) {
    return Object.assign(...Object.entries(values).map(([key, value]) => {
        if (value === null && defaults[key] !== undefined) {
            return [key, defaults[key]];
        }
        return [key, value];
    }).map(([k, v]) => ({[k]: v})));
}

const defaultTriggerRenderer = (title, renderedValue, counter) => (
    <Button primary={renderedValue !== null}
            styleName={counter ? 'filter-dropdown-button-counter' : 'filter-dropdown-button'}>
        {renderedValue === null ? title : renderedValue}
        <Icon name="angle down" />
    </Button>
);

export default class FilterDropdown extends React.Component {
    static propTypes = {
        title: PropTypes.element.isRequired,
        form: PropTypes.func.isRequired,
        renderValue: PropTypes.func.isRequired,
        renderTrigger: PropTypes.func,
        setGlobalState: PropTypes.func.isRequired,
        initialValues: PropTypes.object,
        defaults: PropTypes.object,
        counter: PropTypes.bool,
        open: PropTypes.bool,
        openDropdown: PropTypes.func.isRequired,
        closeDropdown: PropTypes.func.isRequired
    };

    static defaultProps = {
        initialValues: {},
        defaults: {},
        showButtons: true,
        renderTrigger: defaultTriggerRenderer,
        counter: false,
        open: false
    };

    static getDerivedStateFromProps({defaults, initialValues, renderValue}, prevState) {
        return {
            ...prevState,
            fieldValues: _mergeDefaults(defaults, initialValues),
            renderedValue: renderValue(initialValues)
        };
    }

    constructor(props) {
        super(props);
        this.state = {};
    }

    setFieldValue = (field, value) => {
        // Do incremental state updates, to avoid working
        // on an outdated state (consecutive calls)
        const newState = this.setState((prevState) => ({
            ...prevState,
            fieldValues: {
                ...prevState.fieldValues,
                [field]: value
            }
        }));
        this.setState(newState);
    };

    resetFields(fieldValues) {
        this.setState({
            fieldValues
        });
    }

    setRenderedValue = (fieldValues) => {
        const {renderValue} = this.props;
        const renderedValue = renderValue(fieldValues);
        this.setState({
            renderedValue,
        });
    };

    handleClose = () => {
        const {closeDropdown, setGlobalState} = this.props;
        const {fieldValues} = this.state;
        this.setRenderedValue(fieldValues);
        setGlobalState(fieldValues);
        closeDropdown();
    };

    handleOpen = () => {
        const {openDropdown} = this.props;
        openDropdown();
    };

    render() {
        const {title, form, renderTrigger, counter, open} = this.props;
        const {renderedValue, fieldValues} = this.state;

        return (
            <Popup position="bottom left"
                   trigger={renderTrigger(title, renderedValue, counter)}
                   on="click"
                   open={open}
                   onClose={this.handleClose}
                   onOpen={this.handleOpen}>
                {form(fieldValues, this.setFieldValue, this.handleClose)}
            </Popup>
        );
    }
}
