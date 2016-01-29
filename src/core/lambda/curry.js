//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Copyright (C) 2015-2016 Quildreen Motta.
// Licensed under the MIT licence.
//
// See LICENCE for licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

const curry = (arity, fn) => {
  // A curried function; accepts arguments until the number of given
  // arguments is greater or equal to the function's arity.
  const curried = (oldArgs) => (...newArgs) => {
    const allArgs  = oldArgs.concat(newArgs);
    const argCount = allArgs.length;

    return argCount < arity?    curried(allArgs)
    :      argCount === arity?  fn(...allArgs)
    :      /* otherwise */      unrollInvoke(fn, arity, allArgs);
  };

  // When a curried function receives more arguments than the number
  // of arguments it expects, we need to deal with the overflow.
  // The unrolled invocation takes care of this by passing the
  // remaining arguments to the resulting function.
  // This is required for proper composition of curried functions,
  // but fails with the composition of curried and non-curried
  // functions — this library always considers JS functions
  // not generated by *this* function as functions taking an
  // infinite number of arguments.
  const unrollInvoke = (fn, arity, args) => {
    const firstFnArgs = args.slice(0, arity);
    const secondFnArgs = args.slice(arity);

    return fn(...firstFnArgs)(...secondFnArgs);
  };


  return curried([]);
};


// -- Annotations ------------------------------------------------------
if (process.env.NODE_ENV !== "production") {
  require('metamagical/decorators')(
    curry,
    {
      name: 'curry',
      signature: 'curry(arity, fn)',
      type: '(Number, (α₁, α₂, ..., αₙ) -> β) -> (α₁) -> (α₂) -> ... -> (αₙ) -> β',
      category: 'Currying',
      tags: ['Lambda Calculus'],
      stability: 'stable',
      platforms: ['ECMAScript'],
      authors: ['Quildreen Motta'],
      module: 'folktale/core/lambda/curry',
      licence: 'MIT',
      seeAlso: [
        {
          type: 'link',
          title: 'Why Curry Helps',
          url: 'https://hughfdjackson.com/javascript/why-curry-helps/'
        },
        {
          type: 'link',
          title: 'Does Curry Help?',
          url: 'https://hughfdjackson.com/javascript/does-curry-help/'
        }
      ],
      documentation: `
Transforms functions on tuples into curried functions.


## Why?

Sometimes you want to specify part of the arguments of a function, and
leave the other arguments to be specified later. For this, you could
use an arrow function:

    const property = (key, object) => object[key];
    people.map(person => property('name', person));

Currying allows you to construct functions that support partial
application naturally:

    const property = curry(2, (key, object) => object[key]);
    people.map(property('name'));

In essence, currying transforms a function that takes N arguments
into N functions whose each take 1 argument. So, in the example
above, we'd have:

    const property = (key, object) => object[key];
    curry(2, property)
    // => (key) => (object) => object[key];


## Particularities of Folktale's Curry

Because JavaScript is a language where everything is variadic,
currying doesn't always fit. To try to reduce the problems and
work with common JS idioms, currying functions auto-unroll
application. That is, something like:

    const sum = curry(2, (x, y) => x + y);
    sum(1, 2, 3)

Is handled as:

    sum(1, 2)(3)

This ensures that curried functions can be properly composed,
regardless of how you invoke them. But it also means that passing
more arguments to a function than the number of arguments the
whole composition takes will probably break your program.
      `
    }
  );
}
