@annotate: folktale.concurrency.task.task
category: Constructing
---

Constructs a Task and associates a computation to it. The computation is executed every time the Task is ran, and should provide the result of the task: a success or failure along with its value.

A computation is required. For task, this is a function that receives one argument, the resolver, and does some work that may be asynchronous. Once done, the computation uses the resolver to `resolve()` a task succesfully, or `reject()` it with an error.

Asynchronous computations that allocate some external resource (for example, starting an HTTP request) can provide a cleanup function. The `cleanup` function will be called with the resources returned, and will have the chance of disposing of them properly once the Task is finished, either properly, as a success or rejection, or eagerly, as a cancellation.

Optionally, a Task may provide an `onCancelled` function that will be called if the Task is cancelled, before the cleanup.


## Example::

    const { task } = require('folktale/concurrency/task');
    
A simple, successful task::

    const hello = task(resolver => resolver.resolve('hello'));
    
    const result1 = await hello.run().promise();
    $ASSERT(result1 == 'hello');
    
A simple, failed task::

    const nope = task(resolver => resolver.reject('hello'));
    
    try {
      await nope.run().promise();
      throw 'never happens';
    } catch (error) {
      $ASSERT(error == 'hello');
    }
    
An asynchronous task that allocates and frees resources::

    const delay50 = task(
      resolver => {
        const timerId = setTimeout(() => resolver.resolve('yay'), 50);
        resolver.cleanup(() => {
          clearTimeout(timerId);
        });
      }
    );
    
    const result2 = await delay50.run().promise();
    $ASSERT(result2 == 'yay');
    
A task with a cancellation handler::

    let resolved = false;
    const cancelMe = task(
      resolver => {
        const timerId = setTimeout(() => {
          resolved = true;
          resolver.resolve('yay');
        }, 50);

        resolver.cleanup(() => {
          clearTimeout(timerId);
        });

        resolver.onCancelled(() => {
          /* task was cancelled */
        });
      }
    );
    
    try {
      const execution = cancelMe.run();
      execution.cancel();
      const result3 = await execution.promise();
      throw 'never happens';
    } catch (error) {
      $ASSERT(resolved == false);
    }

