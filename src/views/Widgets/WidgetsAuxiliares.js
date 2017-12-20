import React, { Component, cloneElement } from 'react';

export const WidgetSesionesUsadas = ({title, color, value, porc, resetAction}) => {

    let progressColor;
    if (porc < 80) {
        progressColor = "info";
    } else if (porc < 90) {
        progressColor = "warning";
    } else {
        progressColor = "danger";
    }

	return (
		
        <div className={"card " + (color ? `bg-${color}` : '')}>
            <div className="card-body">
                <a href="javascript:void(0);" className="reset-sesiones float-right" onClick={() => resetAction()}>
                    <i className="icon-reload"></i>{' '}Reiniciar
                </a>
                <h4 className="mb-0">{value}</h4>
                <p>{title}</p>
                <Progress className="progress-xs" color={progressColor} value={porc} />
            </div>
        </div>

	);
}

export const WidgetSesionesRestantes = ({title, color, value, porc}) => {

    let progressColor;
    if (porc > 80) {
        progressColor = "success";
    } else if (porc > 10) {
        progressColor = "warning";
    } else {
        progressColor = "danger";
    }

	return (
        <div className={"card " + (color ? `bg-${color}` : '')}>
            <div className="card-body">
                <h4 className="mb-0">{value}</h4>
                <p>{title}</p>
                <Progress className="progress-xs" color={progressColor} value={porc} />
            </div>
        </div>
	);
}
