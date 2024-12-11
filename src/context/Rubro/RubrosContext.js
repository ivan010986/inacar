// RubrosContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const RubrosContext = createContext();

export const RubrosProvider = ({ children }) => {
    const [updatedRubros, setUpdatedRubros] = useState([]);
    const [monthlyTotals, setMonthlyTotals] = useState(Array(12).fill(0));
    const [rubrosTotals, setRubrosTotals] = useState({});
    const [inputValues, setInputValues] = useState({});

    useEffect(() => {
        const savedData = {
            updatedRubros,
            monthlyTotals,
            rubrosTotals,
            inputs: inputValues,
        };
        localStorage.setItem('rubrosData', JSON.stringify(savedData));
    }, [updatedRubros, monthlyTotals, rubrosTotals, inputValues]);

    const value = {
        updatedRubros,
        setUpdatedRubros,
        monthlyTotals,
        setMonthlyTotals,
        rubrosTotals,
        setRubrosTotals,
        inputValues,
        setInputValues,
    };

    return (
        <RubrosContext.Provider value={value}>
            {children}
        </RubrosContext.Provider>
    );
};

export const useRubrosContext = () => {
    const context = useContext(RubrosContext);
    if (context === undefined) {
        throw new Error('useRubrosContext must be used within a RubrosProvider');
    }
    return context;
};
