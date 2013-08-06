/* Trivial utility to create EOT files on Linux */

#include <stdlib.h>
#include <stdio.h>
#include <assert.h>
#include <limits.h>
#include <stdint.h>
#include <string.h>

#include <vector>

#include "OpenTypeUtilities.h"

#ifndef SIZE_MAX
# define SIZE_MAX UINT_MAX
#endif

using std::vector;

int main(int argc, char **argv)
{
    const size_t kFontInitSize = 8192;
    vector<uint8_t> eotHeader(512);
    size_t overlayDst = 0;
    size_t overlaySrc = 0;
    size_t overlayLength = 0;
    size_t fontSize = 0;
    size_t fontOff = 0;
    FILE *input;
    unsigned char *fontData;

    if (argv[1] == NULL || (argv[1][0] == '-' && argv[1][1] == '\0')) {
        input = stdin;
    } else {
        input = fopen(argv[1], "r");
        if (input == NULL) {
            fprintf(stderr, "could not open input file %s, %m\n", argv[1]);
            return 1;
        }
    }

    if ((fontData = (unsigned char *) malloc(fontSize = kFontInitSize)) == NULL) {
        fprintf(stderr, "Allocation failure, %m\n");
        return 1;
    }

    do {
        size_t ret = fread(fontData + fontOff, 1, fontSize - fontOff, input);
        if (ret && fontSize <= SIZE_MAX / 2) {
            fontOff += ret;
            if ((fontData = (unsigned char *) realloc(fontData, fontSize *= 2)) == NULL) {
                fprintf(stderr, "Allocation failure, %m\n");
                return 1;
            }
        } else if (ret) {
            fprintf(stderr, "Too much data, %m\n");
            return 1;
        } else {
            fontData = (unsigned char *) realloc(fontData, fontSize = fontOff);
            break;
        }
    } while (true);

    if (getEOTHeader(fontData, fontSize, eotHeader, overlayDst, overlaySrc, overlayLength)) {
        fwrite(&eotHeader[0], eotHeader.size(), 1, stdout);
        fwrite(fontData, fontSize, 1, stdout);
        return 0;
    } else {
        fprintf(stderr, "unknown error parsing input font, %m\n");
        return 1;
    }
}
