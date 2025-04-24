import styles from './styles.module.scss';
import { FiSearch } from 'react-icons/fi';

const SearchInput = ({ search, handleSearchChange }) => {
    return (
        <div className={styles.searchContainer}>
            <FiSearch className={styles.searchIcon} size={18} />
            <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search items..."
                className={styles.searchInput}
                aria-label="Search items"
            />
        </div>
    );
};

export default SearchInput;