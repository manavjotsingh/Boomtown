import React from 'react';

const initialState = {
    itemowner: {},
    title: 'Dummy Title',
    description: 'Dummy description',
    tags: [],
    created: new Date(),
    imageurl: 'http://via.placeholder.com/350x250?text=Please select an image'
}

export const ItemPreviewContext = React.createContext();

const ItemPreviewProvider = (props) => {
    // setItem works as setstate for item to update item which is working as a state
    const [item, setItem] = React.useState({ item: initialState });

    const updatePreview = (itemInput) => {
        const newItem = { ...item, ...itemInput }
        setItem({ newItem });
    };

    const resetPreview = () => {
        setItem(initialState);
    };
    return (
        <ItemPreviewContext.Provider
            value={{
                state: item,
                updatePreview: updatePreview,
                resetPreview: resetPreview
            }}>
            {props.children}
        </ItemPreviewContext.Provider>
    );
};

export default ItemPreviewProvider;