import {getParenthesesRange} from './text';

const gradientLength = 'gradient'.length;
const conicGradient = 'conic-';
const conicGradientLength = conicGradient.length;
const radialGradient = 'radial-';
const linearGradient = 'linear-';

export interface parsedGradient {
    type: string;
    content: string;
    hasComma: boolean;
}

// Parse the value according to the specifiction.
//
// Specification: https://drafts.csswg.org/css-images-4/#gradients
export function parseGradient(value: string): parsedGradient[] {
    const result: parsedGradient[] = [];

    // Loop trough the value until we find the first `gradient` keyword.
    // We will be using the indexOf to find the keyword. From their on
    // we will check which specific graidient we are dealing with.
    // Then we will try to parse the rest of the value as a gradient.
    let index = 0;
    let startIndex = conicGradient.length;
    while ((index = value.indexOf('gradient', startIndex)) !== -1) {
        let typeGradient: string;
        // Now we check the type of gradient.
        // the current index starts at `g` of gradient.
        // So we have to do a reverse lookup to find the type of gradient.
        // Because each type of gradient has a different length
        // will we get the substring of the possible gradient types.
        [linearGradient, radialGradient, conicGradient].find((possibleType) => {
            if (index - possibleType.length >= 0) {
                const possibleGradient = value.substring(index - possibleType.length, index);
                if (possibleGradient === possibleType) {
                    // Check if the type has a `-` before the `type-gradient` keyword.
                    // If it does, it's a repeating gradient.
                    if (index - possibleType.length - 1 >= 9) {
                        if (value[index - possibleType.length - 1] === '-') {
                            typeGradient = `repeating-${possibleType}gradient`;
                            return true;
                        }
                    }
                    typeGradient = `${possibleType}gradient`;
                    return true;
                }
            }
        });

        if (!typeGradient) {
            break;
        }

        // Now we know the type of gradient.
        // We can go parse the rest of the value as a gradient.
        const {start, end} = getParenthesesRange(value, index + gradientLength);

        const content = value.substring(start + 1, end - 1);
        startIndex = end + 1 + conicGradientLength;

        result.push({
            type: typeGradient,
            content,
            hasComma: true,
        });
    }

    // Set the last result to not have a comma.
    if (result.length) {
        result[result.length - 1].hasComma = false;
    }


    return result;
}
