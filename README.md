Testing Cross-tab Communication Performance
===========================================
There are currently three web APIs that can be used for cross-tab communication: `Local Storage`, `Broadcast Channels` and `Shared Workers`.

In many of these tests, `Shared Workers` outperformes the other APIs by at least one order of magnitude. Unfortunately, not all major browsers 
support the API. Therefore, any public-facing cross-tab communication framework should probably dynamically degrade from the better API to at 
least `Local Storage` since it enjoys much wider support in browsers.

## Author
Fredric Rylander, https://github.com/fredricrylander

## Date
2015-06-28

## Requirements
These tests has been written in ECMAScript 5.1 in order to be compatible with contemporary browsers. 
Currently, only Firefox version 38 supports all three web APIs.

## License
    The MIT License (MIT)

    Copyright (c) 2015 Fredric Rylander

    Permission is hereby granted, free of charge, to any person obtaining a
    copy of this software and associated documentation files (the "Software"),
    to deal in the Software without restriction, including without limitation
    the rights to use, copy, modify, merge, publish, distribute, sublicense,
    and/or sell copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
    THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
    IN THE SOFTWARE.