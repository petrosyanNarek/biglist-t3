import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { arrayMove } from '@dnd-kit/sortable';
import {fetchItems, setSelectedItem, setSortOrder} from '../../api/items';
import debounce from 'lodash.debounce';
import styles from './styles.module.scss';
import SearchInput from "../searchInput";

const List = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [offset, setOffset] = useState(0);
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const loader = useRef(null);

    const debouncedSearch = useCallback(
        debounce((val) => {
            setQuery(val);
            setOffset(0);
            setHasMore(true);
        }, 300),
        []
    );

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        debouncedSearch(e.target.value);
    };

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const res = await fetchItems({ offset, limit: 20, search: query });

            setItems((prev) =>
                offset === 0 ? res.data.items : [...prev, ...res.data.items]
            );
            setOffset((prev) => prev + 20);
            setHasMore(res.data.hasMore);
        } catch (error) {
            console.error('Error loading items:', error);
        } finally {
            setLoading(false);
        }
    }, [offset, loading, query, hasMore]);

    useEffect(() => {
        setOffset(0);
        setItems([]);
        loadMore();
    }, [query]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const firstEntry = entries[0];
                if (firstEntry.isIntersecting && hasMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 0.1 } // More sensitive trigger
        );

        const currentLoader = loader.current;
        if (currentLoader) observer.observe(currentLoader);

        return () => {
            if (currentLoader) observer.unobserve(currentLoader);
        };
    }, [loadMore, hasMore, loading]);

    const onDragEnd = async (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);

            if (oldIndex === -1 || newIndex === -1) return;

            const reorderedItems = arrayMove(items, oldIndex, newIndex);
            setItems(reorderedItems);

            try {
                await setSortOrder({
                    id: active.id,
                    toIndex: newIndex,
                });
            } catch (error) {
                console.error('Failed to update order', error);
            }
        }
    };

    return (
        <div className={styles.listContainer}>
            <SearchInput
                search={search} handleSearchChange={handleSearchChange}
            />

            <DndContext onDragEnd={onDragEnd}>
                <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                        {items.map((item) => (
                            <SortableItem key={item.id} isChecked={item.selected} id={item.id} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <div ref={loader} className={styles.scrollHint}>
                {loading ? 'Loading more...' :
                    hasMore ? 'Scroll down to load more' : 'All items loaded'}
            </div>
        </div>
    );
};

const SortableItem = ({ id, isChecked }) => {
    const [checked, setChecked] = useState(isChecked);

    const {
        attributes,
        listeners,
        setNodeRef,
        isDragging,
        transform,
        transition
    } = useSortable({ id });

    const style = {
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        transition,
        zIndex: isDragging ? 999 : 'auto'
    };

    const handelSelectChange = (e) => {
        e.stopPropagation();
        setChecked(e.target.checked);
        setSelectedItem(id);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`${styles.itemRow} ${isDragging ? 'sortable-drag' : ''}`}
        >
            <label htmlFor={id}>
                <input
                    id={id}
                    type="checkbox"
                    defaultChecked={isChecked}
                    checked={checked}
                    className={styles.checkbox}
                    onChange={handelSelectChange}
                    onClick={(e) => e.stopPropagation()}
                />
                <span>Item #{id}</span>
            </label>
            <div {...attributes} {...listeners} className={styles.dragHandle}>
                ⠿
            </div>
        </div>
    );
};

export default List;
