const generate_random_filename = () => {
    const random_number = Math.floor(Math.random() * 10 ** 8);
    const random_filename = `${random_number}`;
    return random_filename;
};

export { generate_random_filename };

