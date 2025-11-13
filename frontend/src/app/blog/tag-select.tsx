'use client';

import * as React from 'react';
import { AsyncSelect } from '@/components/ui/async-select';
import { useGetAllTags } from '@/lib/service/tag';
import { Tag } from '@/lib/service/tag';

type Props = {
    label?: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    width?: string | number;
};

export function TagSelect({
    label = 'Tags',
    placeholder = 'Select tag…',
    value,
    onChange,
    disabled,
    width,
}: Props) {
    return (
        <AsyncSelect<Tag>
            useOptions={useGetAllTags}
            getOptionValue={(t) => t.id}
            getDisplayValue={(t) => t.name}
            renderOption={(t) => <span className="text-sm">{t.name}</span>}
            label={label}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            visibleCount={5}
            clearable
            disabled={disabled}
            width={width}
            filterFn={(t, q) => t.name.toLowerCase().includes(q)}
            noResultsMessage="No tags matched."
        />
    );
}
