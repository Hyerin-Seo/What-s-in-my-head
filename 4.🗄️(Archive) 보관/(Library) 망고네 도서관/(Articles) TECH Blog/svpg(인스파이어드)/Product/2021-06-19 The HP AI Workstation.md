---
title: "The HP AI Workstation"
url: https://www.svpg.com/the-hp-ai-workstation/
date: 2021-06-19
author: Marty Cagan
category: Product
tags: [ai]
source: SVPG (svpg.com)
유형: 자료
구역: 4.archive
분류:
  - (Library) 망고네 도서관
주제:
상태:
요약:
작성일: 2026-09-23
마감:
커버:
상위: "[[📖 SVPG(인스파이어드)]]"
링크:
담당:
작성자:
---

# The HP AI Workstation

*NOTE: This article is very unusual. It is the very first article I ever published. It was published in the HP Journal, in March 1986, which is from 35 years ago. Since that was well before the Internet, it’s not online anywhere that I could find it, except in a PDF archive. So I used an OCR scanner and am re-publishing the article here. It’s a bit of a time-capsule, describing some technology that at the time seemed to me to be near imminent, but for the most part ended up taking several decades to materialize, and other technology that clearly went in other directions. But I found it fascinating to revisit our expectations in AI, speech recognition, natural language understanding, as well as programming languages, developer productivity and development environments.*

**HP JOURNAL – March 1986**

**An Introduction to Hewlett-Packard’s AI Workstation Technology**

*Here is an overview of HP artificial intelligence workstation research efforts and their relationship to HP’s first AI product, a Common Lisp Development Environment.*

by Martin R. Cagan

Hewlett-Packard recently entered the artificial intelligence (Al) arena with the announcement of its first symbolic programming product, the Hewlett-Packard Development Environment for Common Lisp. The technology underlying HP’s initial product entry is the result of more than five years of research and development on what has evolved into the Hewlett-Packard AI Workstation. This article provides an overview of the AI Workstation technology.

The Hewlett-Packard AI Workstation represents the aggregate of the major symbolic programming software development efforts at Hewlett-Packard. (Previously, this research effort was internally referred to as the *Prism* program.)

The term AI Workstation refers to the company-wide internal research and development program in Al, rather than to a particular product. In addition to the many HP divisions whose efforts have contributed key system components, many important concepts are based on research from the Massachusetts Institute of Technology (MIT), the University of California at Berkeley, and the Xerox Palo Alto Research Center (PARC). The University of Utah, in particular, has contributed significantly.

Currently, HP’s AI Workstation is actively used by well over two hundred people at various HP divisions, as well as by students and professors at major research universities across the United States. HP recently announced a $50 million grant of hardware and software which will provide Hewlett-Packard AI Workstations to selected major computer science universities.

The AI Workstation technology is both portable and scalable, and can run on a variety of processors and operating systems, including the new HP 9000 Series 300 workstation family under the HP-UX operating system.

The first and primary product that is an offspring of the AI Workstation technology is the *Hewlett-Packard Development Environment for Common Lisp*, announced at the 1985 International Joint Conference on Artificial Intelligence. Much of the technology described in this article is experimental and the reader should not assume the software discussed here can be purchased. Those components that are part of the Hewlett-Packard Development Environment for Common Lisp or other products will be noted.

There has been a great deal written in the press recently regarding symbolic programming technology and AI. The transition from numeric programming to symbolic programming is analogous to the “algebraization” of mathematics that occurred a century ago. The axiomatic, abstract algebraic viewpoint that was needed to simplify and clarify so many puzzles then, is likened to the need for symbolic programming techniques to help solve today’s difficult computational problems.

AI applications such as natural language understanding, theorem proving, and artificial vision all rely on symbolic programming techniques for their flexibility and power in manipulating symbols, manipulating relationships between symbols, and representing large and complex data structures. The AI Workstation is a software system designed to solve problems using symbolic programming techniques. This article explores the AI Workstation by describing it from four perspectives: the market, the technology, the environment, and the applications.

**THE MARKET**

There are many opinions concerning the future direction of the software market, but most agree that software is steadily becoming more complicated, powerful, and intelligent. Hewlett-Packard’s AI Workstation provides the technology for developing and executing intelligent and sophisticated applications.

At Hewlett-Packard, Al techniques are viewed as an enabling technology. The AI Workstation provides tools and facilities that enable the programmer to create applications that were previously considered infeasible. These applications include expert systems, artificial vision, natural language interfaces, robotics, and voice recognition systems. Development and execution of these Al applications often require capabilities not available or feasible in conventional computer systems. For example, consider an expert tax advisor application. Such a system would need to embody the relevant knowledge and reasoning strategies of human tax advisors. AI-based techniques provide the necessary mechanisms for this knowledge representation and reasoning.

The AI Workstation’s use need not be restricted to problems requiring the direct employment of Al technology, however. It has also been designed to foster improvements in the conventional software development market. For example, a typical tax accounting application may not need Al techniques for its implementation, yet can be implemented and maintained more productively by employing AI-based software development tools, such as tools that intelligently help locate and diagnose errors in the program code. The AI Workstation is used by the software developer to develop applications, and by end users to run AI-based applications. One of the AI Workstation’s primary contributions to the AI market is that it provides both a development environment and an execution environment for AI applications, and it provides both on low-cost, conventional hardware such as the HP 9000 Series 300.

The software developer sees the AI Workstation as an environment tailored for the rapid development of software systems. The languages provided are geared for high productivity. The environment allows multiple programs, written in multiple languages, to be created, tested, and documented concurrently. Interpreters and compilers allow systems to be developed incrementally and interactively. The software developer can use the AI Workstation for the development of knowledge-based systems, or simply as a more productive means of generating conventional software written in conventional languages. In general, then, two reasons motivate the use of the AI Workstation as a software development machine. Either the AI Workstation technology is necessary to develop a particular AI application, or the user has a need to develop conventional applications in conventional languages more productively.

The end user of AI Workstation-based applications views the AI Workstation as an execution environment for applications that are highly interactive, intelligent, and customizable. The end user benefits from the total system, with high-resolution graphics, color displays, local area networks, multiple windows, and special-purpose input devices. The AI Workstation is modular and scalable so that a particular application can run with a minimum of resources and therefore keep the delivery vehicle’s cost as low as possible. This is a major feature for many AI Workstation users who wish to both develop and distribute applications using the AI Workstation. To these users, providing a low-cost delivery vehicle is a major concern.

The AI Workstation also supports the notion of a server. A server is a system that is located on a network, dedicated to running a particular application. Other systems on the network, possibly even other servers, can send requests to the server to perform a function. The server performs the task and when appropriate, responds to the sender. AI Workstation-based servers and workstations make it easy for applications to create and send programs back and forth. A machine receiving a program is able to execute the program within the context of its local environment. Networks of servers running AI Workstation-based applications may prove to be a cost-effective solution for many users.

There has already been a great deal written about the large potential for productivity and quality improvements in software development, and given the rising cost of software development, there is a high demand for such improvements. Traditionally, AI researchers have demanded more productive and powerful software engineering tools from their environments. This was necessary to manage the scope and complexity of their software systems. Now that personal workstations are cost-effective, a wide range of software engineering tools, previously feasible only on expensive mainframes or special-purpose hardware, are now available for the design, development, testing, and maintenance of software systems.

**THE TECHNOLOGY**

The evolution of the technology underlying the AI Workstation began with a joint development effort by HP Laboratories and the University of Utah. The goal of this effort was to create a portable, high-performance implementation of a modern Lisp system so that programmers could enjoy efficiency and portability comparable to C and Fortran, along with the interactive and incremental program development and debugging environment of Lisp.

Previously, to enjoy high performance from Lisp, special-purpose, expensive hardware was required. A major contribution of the resulting underlying Lisp technology is that it is efficient even on conventional, low-cost hardware.

**Lisp**

Lisp is the dominant programming language for artificial intelligence research in the United States. But why Lisp? From a historical standpoint, Lisp is second in endurance and longevity only to Fortran. The modern Lisp systems, such as Hewlett-Packard’s implementation of Common Lisp feature less cryptic alternatives to the basic Lisp commands, as well as many of the control structures and data types that have proven useful in conventional languages. Although Lisp has evolved from its original form, it is for the most part as it was designed in 1958 by John McCarthy. Unlike Fortran, however, Lisp is attracting new converts daily, and is more popular today than it has ever been in its 28-year history. Unfortunately, many programmers in the industry today have not yet had the opportunity to work with Lisp as a production language, thus making it difficult to compare Lisp with C, Pascal, Fortran, or COBOL. A discussion of the primary features of Lisp follows, so that programmers of conventional languages can get an idea of what it is like to develop in a Lisp environment.

– Lisp supports incremental development. In conventional languages, when trying to build a program incrementally, the programmer must perform a number of time-consuming tasks, such as writing procedure stubs, including declarations, and constructing or simulating data. Each iteration requires an edit/compile/link/test cycle. In contrast, the Lisp programmer can simply write a function in terms of other functions that may or may not have been written yet and build either in a top-down fashion or in a bottom-up fashion, creating and testing continuously. The function can be executed as soon as it has been typed in.

– Lisp programs don’t need declarations. Unlike C, Pascal, COBOL and most other conventional languages in which the programmer must specify the data structures and variables before using them, Lisp allocates the right amount of storage, when it is needed, automatically. This allows the programmer to develop functions truly “on the fly,” without maintaining and propagating declarations throughout the program. Once a program has stabilized, the programmer can add declarations to improve the efficiency.

– Lisp provides excellent debugging. The Lisp environment supports an attitude towards error diagnosis that is quite different from that induced by conventional programming languages. When a bug is encountered during development of a Lisp program, the Lisp environment invites the programmer to explore the environment in which the exception was detected. The full power of Lisp itself is available to the programmer when debugging. Data structures can be analyzed and functions redefined. In fact, the programmer can even construct new Lisp functions on the fly to help diagnose the problem. In Lisp, a program error is less an error and more a break point where the programmer can examine the system.

– Lisp manages memory automatically for the programmer. Memory management and reclamation are taken care of automatically in a Lisp environment. With conventional languages, memory management often accounts for a significant portion of the programmer’s code. In Lisp systems, however, Lisp itself tracks memory use and reclaims unneeded storage automatically. This service allows the programmer to concentrate on the problem at hand, without having to manage the resources needed to implement the problem’s solution.

– Lisp programs can easily create or manipulate other Lisp programs. Lisp is unique among major languages in that Lisp programs and data are represented with the same data structure. The benefits that result from this characteristic are many, and have proven to be among the major contributions to the power of Lisp. This characteristic, for example, makes it easy to write Lisp programs that create other Lisp programs, as well as to write Lisp programs that can understand other Lisp programs. Programs can be manipulated as data, and can be immediately executed or transferred to another Lisp machine for execution.

– Lisp programs can run with a mix of compiled and interpreted code. The AI Workstation provides both a Lisp compiler and a Lisp interpreter. For development, the interpreter allows enhanced debugging and quick incremental design. Once a program is ready to be put into use, it can be compiled to increase its performance and reduce its code size. During development, however, the programmer often needs to run with a mix of compiled and interpreted code. The AI Workstation’s Lisp has the feature of allowing an arbitrary combination of compiled and interpreted code. It is not unusual for a programmer to redefine compiled functions at run time to examine and explore the behavior of the application.

– Lisp is comfortable with symbols. In conventional languages, arbitrary symbols are treated as unstructured data. The programmer coerces them into a character array and analyzes the array byte by byte until some sense can be made out of them in terms of the data types understood by the language. Lisp, however, is a symbolic programming language. Arbitrary symbols are first-class objects, and can be manipulated as symbols rather than by trying to treat them as elements in an array. The programmer, in turn, can give symbols properties and manipulate relationships between symbols.

– Lisp is easy to extend. Functions defined by the programmer are treated in the same way as system-defined functions. When implementing complex systems, it is often useful to develop a specific vocabulary of functions for conversing in a particular problem domain. With Lisp, these specific, problem-oriented languages can be developed easily and quickly.

Because of its longevity and its many useful features, the reader may wonder why conventional programmers have not been using Lisp for years. There are three major reasons for this.

First, until very recently, the Lisp environments described above were available only on large and expensive machines, and even on these machines, Lisp was using more than its share of resources. Only now, with the availability of inexpensive, high-performance workstations and improved compiler technology, has Lisp become a cost-effective solution for conventional software development.

Second, production languages were previously judged largely on the efficiency of compiled code. Now that the constrained resource is the software development cost rather than the delivery machine hardware, languages are being judged based on a different set of values.

Third, while the features of Lisp described above are valuable, they do not come without a cost. Most Lisp systems remain ill-suited for such problems as real-time and security-sensitive applications. Reducing these costs is a major research topic at many university and industrial research laboratories. At HP, we have acknowledged the fact that different languages are optimized to solve different problems, and we have provided the ability for the Lisp environment to access arbitrary C, Pascal, and Fortran routines. This has important ramifications for HP and its customers.

It is not necessary to discard existing code and data libraries to enjoy the benefits of Lisp. For example, an intelligent front end that accesses Fortran code libraries for instrument control can be written in Lisp. (The extensions to Common Lisp for foreign function calling are part of the Hewlett-Packard Development Environment for Common Lisp product.)

AI Workstation-based applications are often blends of Lisp and conventional language components.

**Object-Oriented Programming**

The AI Workstation provides two higher-level languages, themselves implemented in Lisp, which support alternative paradigms for software development. The first of these language extensions supports object-oriented programming, while the second supports rule-based programming. HP provides a Lisp-based object-oriented programming language. (The extensions to Common Lisp for object-oriented programming are part of the Hewlett-Packard Development Environment for Common Lisp product.)

Most of the AI Workstation’s environment itself is written using this technology. Object-oriented programming is very much on the rise throughout the entire industry, and for good reason. Object-oriented programming brings to the programmer a productive and powerful paradigm for software development. It is a paradigm that addresses head-on the serious problems of code reusability and software maintainability by employing powerful techniques such as inheritance, data abstraction, encapsulation, and generic operations.

Unlike most conventional languages, object-oriented Lisp is a language designed to support a particular programming methodology. The methodology, with support from the language, provides explicit facilities for code reusability, software maintainability, program extensibility, and rapid development.

The essential idea in object-oriented programming is to represent data by a collection of objects, and to manipulate data by performing operations on those objects. Each object defines the operations that it can perform.

The first facility I will describe is the notion of *data abstraction*. Using the object-oriented style of programming, each object is regarded as an abstract entity, or “black box,” whose behavior is strictly determined by the operations that can be performed on it. In other words, the only way an object is accessed or modified is by performing the operations explicitly defined on that object. In particular, the internal data structure used to represent the object is private, and is directly accessed only by the operations defined on the object. Operations are invoked by sending messages to the object.

One advantage of the object-oriented style of programming is that it encapsulates in the implementation of an object, the knowledge of how the object is represented. The behavior of an object is determined by its external interface, which is the set of operations defined on the object. If the designer changes the representation of an object, and the externally visible behavior of the operations is unchanged, then no source code that uses the object need be changed.

For example, suppose we wish to define a type *dog*. Using the object-oriented extensions to Common Lisp, our definition might be:

(define-type dog

(:var name)

(:var age)

(:var owner)

)

This says that we are defining a new type of object *dog*, with an internal representation consisting of a name, an age, and an owner. For example:

(setf fido (make-instance ‘dog :name “Fido”))

This sets the variable *fido* to an instance of the type *dog*, with the name “Fido.” If we wished, we could create one hundred instances of the type dog, each unique, whether or not they have the same name (just as there are many dogs, with more than one named “Fido”). Note that externally, nothing knows of our internal representation of the type dog. We could be implementing the dog’s internal representation any number of ways.

We define operations on type dog by specifying the type and the operation, any parameters required by the operation, and the implementation of the operation. For example, to define an operation that will let us change the dog’s owner:

(define-method (dog :give-new-owner) (new-owner)

(setf owner new-owner)

Note that the implementation of the operation is the only place where the internals of type dog are referenced. The value of this encapsulation is that if we decide to change the implementation of type dog, then it is only the type definition and the operations defined on that type that need to be modified.

We can access and manipulate the object by sending messages to it requesting it to perform specific operations. For example, to change Fido’s owner to “Mandy”:

(-> fido :give-new-owner “Mandy”)

This statement reads, “Send the message to fido :give-new-owner ‘Mandy’.”

Typically, we would define a number of operations for the type dog, such as sit, stay, come, and speak. These could then be invoked:

(-> fido :sit)

(-> fido :stay)

(-> fido :come)

(-> fido :speak)

The second facility I will describe addresses the problem of *code reusability*. To a certain extent, the data abstraction facilities described above help ease the reuse of code modules in that the implementation is encapsulated, and the external interface is well-defined.

More directly applicable to this problem is the concept of *inheritance*. A new type of object can be defined that inherits from other types. All of the operations that manipulate the types and the data maintained by the types are inherited. A new type definition the selectively override specific characteristics of the types that it inherits from. Thus, to define a new type that is only slightly different from some existing type, one might simply have the new type inherit from the existing type and override those aspects that differ in the new type. For example, to define a new type of dog, *golden-retriever*:

(define-type golden-retriever

(:inherit-from dog)

(:var number-of-tennis-balls-retrieved)

)

This says that we want to define a new type *golden-retriever*, which inherits the data and operations from the type *dog*. In addition to the inherited attributes, we define golden-retriever’s to maintain the attribute number-of-tennis-balls-retrieved. Note that when using an object, one cannot observe whether or not that object’s type was defined using inheritance.

We create an instance of the new type golden-retriever:

(setf mac (make-instance ‘golden-retriever :name “Mac”))

For this new type of dog, we would have our own implementation of the :speak operation, one that produces a deeper bark than the inherited version. We would also have some additional operations defined which are appropriate only with objects of the type golden-retriever.

For example, we have the additional operation *fetch*, which of course is an attribute of all retrievers, but not all dogs, as well as the new operation *:make-coffee* (Mac is a very smart dog).

These could then be invoked:

(-> mac :speak)

(-> mac :fetch)

(-> mac :make-coffee :time 0700)

Note that we could have made further use of inheritance by first defining a type *retriever* that inherited from type *dog*, and then defining the new types *golden-retriever* and *labrador-retriever* which inherit from the type retriever.

Another facility provided by object-oriented Lisp is the support of a powerful form of generic operations known as *polymorphism*.

When one performs an operation on an object, one is not concerned with what kind of object it is, but rather that an operation is defined on the object with the specified name and the intended behavior. This ability is lacking in languages like Pascal, where each procedure can accept only arguments of the exact types that are declared in the procedure header.

As an example of the value of generic operations, suppose one day we attempt to replace Man’s Best Friend with a robot, presumably one domesticated to the same extent as a dog is. We could implement the new type *robot* as follows:

(define-type robot

(:var name)

(:var model)

(:var owner)

)

To create an instance of type robot:

(setf roby (make-instance, robot :name ‘Roby”))

Suppose that we have an existing library of applications that direct objects of the type golden-retriever in various tasks. If we were to implement the same functional operations performed by objects of type golden-retriever for the type robot, then all of our application code would work unchanged:

(-> roby :sit)

(-> roby :stay)

(-> roby :come)

(-> roby :fetch)

(-> roby :speak)

(-> roby :make-coffee :time 0700)

Note that while the implementations of these operations differ, the functional specification and the external protocol robot dealing with objects of type *golden-retriever* and *robot* are defined to be the same, so our applications work unchanged, and we save on dog food, too.

The facilities of object-oriented programming described here can go a long way towards improving program maintainability, program extensibility, and code reusability.

Object-oriented programming has been used to implement operating systems, window managers, market simulations, word processors, program editors, instrument controllers, and games, to name just a few of its applications. Its paradigm has proven productive, powerful, and easy to learn and use.

**Rule-Based Programming**

The second of the alternative paradigms provided in the AI Workstation is the Hewlett Packard Representation Language (HP-RL), HP’s experimental rule-based programming language.

HP-RL is intended to support the development of knowledge-based software systems. Knowledge-based software systems, which include expert systems, are systems that search a knowledge base of information and attempt to make deductions and draw conclusions using the rules of logical inference. A knowledge base is a database that embodies the knowledge and problem-solving strategies of human experts.

In an expert system, there is rarely a procedural description defined in advance for solving a problem. The system must search the knowledge base and make inferences by using the rules and strategies defined by the developer. Current knowledge-based software systems include applications such as medical consultation systems, integrated circuit diagnostic systems, tax advisors, and natural language understanding systems. The key to knowledge-based systems lies in representing the vast amounts of knowledge in an organized and manageable structure. Without such organization, problems quickly become intractable. An intractable problem is one that cannot be solved in a reasonable amount of computation time. HP-RL provides data structures and control structures specifically for knowledge representation, knowledge organization, and reasoning about that knowledge. HP-RL allows knowledge to be represented as *frames*.

A frame is a data structure that groups together arbitrary amounts of information that are related semantically. Typically, a frame is used to store information specific to, or about, a particular entity. HP-RL allows knowledge to be organized into frames of related information. Like object oriented programming, HP-RL provides the ability for frames to inherit information from other frames.

For example, a frame that describes a specific entity such as a person, Jane, might inherit characteristics from related entities such as scientist and female. Therefore, the entity Jane automatically inherits all of the attributes of females and scientists. Attributes specific to Jane can then be specified to differentiate Jane from other female scientists.

Frames can be grouped into domains of knowledge. This sort of partitioning reduces problem complexity, and can also improve the efficiency of searches through the knowledge base by helping the program avoid searching through irrelevant knowledge. Searching through the knowledge base is a sophisticated process performed by the HP-RL inference engine. The inference engine is the facility that scans the knowledge base trying to satisfy rules. Rules in HP-RL are frames composed of a set of premises and conclusions, similar to an if-then construct in conventional languages. HP-RL provides both forward chaining and backward chaining rules. The inference engine applies forward chaining, or data driven, rules to infer conclusions given verified premises. The inference engine applies backward chaining, or goal driven, rules to find verifiable premises, given a desired conclusion.

As an example, consider a rule that says: *If a dog is a golden retriever, then the dog likes tennis balls.*

If we define the rule to be a forward chaining rule, then when the inference engine is searching the knowledge base, if the current data supports the assertion that the dog is a golden retriever, then we can infer that the dog likes tennis balls.

If we define the rule to be a backward chaining rule, then when the inference engine is searching the knowledge base, if the desired goal is to find a dog that likes tennis balls, then the inference engine will check to see if the current data supports the assertion that the dog is a golden retriever.

One of the primary differences between rule-based approaches and conventional programming is that in rule based programs, the program’s flow of control is not explicit in the program. The process of deciding what to do next is consciously separated from data organization and management. The programmer can help direct searches by using heuristics. A heuristic is a rule that guides us in our navigation and search through a knowledge base. Managing searches through the knowledge base is a major research topic, since an intelligent and selective search of a knowledge base can make the difference between a usable system and an unusable system.

Searching the knowledge base is where most of the computing resources are spent when using a knowledge-based system. To help with this problem, HP-RL provides for the incorporation of heuristics about dealing with other heuristics, which can be used to govern the strategy of the program and therefore conduct searches more intelligently. HP-RL currently contains a number of experimental facilities which are being studied and tested to discover more effective mechanisms for performing the difficult task of capturing and using knowledge.

**THE ENVIRONMENT**

One of the primary differences between programming with Lisp and programming with other languages is the environment provided for the programmer. The AI Work station provides access to all data and execution via an integrated environment. The user environment is unusually flexible and powerful. It contains a large and powerful collection of text-manipulation functions and data structures useful in constructing user interfaces, text and graphics editors, and browsers. The following sections explore these various components of the AI Workstation user environment.

**Editing**

The AI Workstation environment contains a version of EMACS, an editor originally developed by Richard Stallman at MIT. Hewlett-Packard’s object-oriented Lisp implementation of EMACS, like the original MIT EMACS, is a *customizable*, *extensible*, *self-documenting*, *screen oriented*, display editor.

*Customizable* means that users can mold the AI Workstation EMACS in subtle ways to fit personal style or editing tasks. Many user-level commands exist to allow the user to change the environment’s behavior dynamically. Customization is not limited to programmers; anyone can easily customize the environment.

*Extensible* means that the user can make major modifications and extensions to the AI Workstation EMACS. New editing commands can be added or old ones changed to fit particular editing needs, while the user is editing. The user has a full library of text-manipulation functions at hand for the creation of new editing functions. This type of extensibility makes EMACS editors more flexible than most other editors. Users are not constrained to living with the decisions made by the implementers of the AI Workstation EMACS. If the user has a need for a new function, or a reason to modify the behavior of an existing function, then the user is able to make the modification quickly and easily.

*Self-documenting* means that the AI Workstation EMACS provides powerful interactive self-documentation facilities so that the user can make effective and efficient use of the copious supply of features.

*Screen-oriented* means that the user edits in two dimensions, so the page on the screen is like a page in a book, and the user has the ability to scroll forward or backward at will through the book. As the user edits the page, the screen is updated immediately to reflect the changes made. Just as many books on a desk can be open and in use at once, with the AI Workstation EMACS, many screens can be visible and active simultaneously. In fact, one of HP’s extensions to MIT’s EMACS is the ability not only to have multiple screens active on a single physical display, but also to have multiple screens on multiple physical displays. (The EMACS-based editing environment described here is part of the Hewlett-Packard Development Environment for Common Lisp product.)

**Browsing**

Another feature of the AI Workstation user environment is a large library of tools known as browsers. Browsers are more than an integral component of the user environment; they are a metaphor for using the environment. A browser is a simple tool for the convenient perusal and manipulation of a particular set of items.

Experimental browsers in the AI Workstation environment include documentation browsers, file browsers, mail browsers, source code browsers, and application browsers. These browsers range from simple to very complex. Users can list all the mail messages sent by a particular person regarding a particular subject, or can instantly retrieve the definition of a particular Lisp function.

The user can conduct automated searches of the documentation, or can browse and manipulate the contents of a complex data structure. Browsers provide a simple, intuitive, integrated interface that is useful for handling a wide range of problems. The environment provides a library of browser construction tools and functions to allow users to create their own browsers for their particular applications and needs.

**Programming**

On the AI development machine, a large portion of the user environment is tuned to support the programming task, which includes activities such as program editing, debugging, testing, version and configuration management, and documentation.

The AI Workstation supports development in Lisp, C, Pascal, and Fortran. In addition, a toolkit is provided to let users customize the environment for other languages. The AI Workstation provides an integrated and uniform model of multilingual software development. One of the major features of the AI Workstation user environment is the interface to the underlying Lisp system. Lisp programmers enjoy direct access to the Lisp compiler and interpreter without having to leave the environment. This means that a program can be edited, tested, debugged, and documented incrementally and interactively as the program is developed. The editing is assisted by an editor that understands the syntax of Lisp. Testing is assisted by Lisp interface commands, which pass the text from the program editor to the underlying Lisp system and return the results back to the environment. Debugging is assisted by an interactive debugger, function stepper, and data inspector available directly from the environment. Program documentation is assisted by documentation tools designed for the programmer which generate much of the formatting details automatically.

Using the foreign function calling facilities of the AI Workstation described earlier, non-Lisp programmers can also enjoy many of the benefits of interactive, incremental development. For example, the AI Workstation contains full two- and three-dimensional vector and raster graphics operations. (The graphics facilities referred to are provided on the HP 9000 Series 300 running under the HP-UX operating system.) While these operations are C routines, all are directly accessible from the Lisp environment.

Typically, C programmers must iterate through the edit/compile/link/test cycle as they develop a graphics application. In contrast, using the AI Workstation, C programmers can step through the development of their graphics applications statement by statement, and enjoy immediate feedback simply by observing the results on the screen. Once the program is functionally correct, the programmer can convert the statements into a formal C program, and compile it with the standard C compiler.

**Managing**

The AI Workstation user environment contains a variety of optional service applications to support the programmer in dealing with office and management functions. Experimental applications developed with this technology include electronic mail, project management, documentation preparation, slide editing, calendar, spreadsheet, information management, and telephone services. Each of these applications, once the user chooses to include it, becomes an integral part of the environment. Because all of these applications are written using the AI Workstation environment facilities, they are customizable, extensible, and accessible from anywhere in the environment.

For example, the user can move from creating a slide, to reading a mail message, to testing Lisp code, and back to creating the slide.

**Interfacing**

The AI Workstation’s user environment contains tools that greatly simplify the incorporation of new input and output devices such as tablets, touchscreens, or voice synthesizers. In addition to supporting standard keyboard and mouse input, experimental versions of the AI Workstation environment also support joystick, tablet, touchscreen, videodisc, voice input and output, and touch tone telephone input. The user environment also supports many user interface models, and provides a library of environment functions to help users define their own user interface model. Existing user interface models include pop-up menus, softkeys, English commands, and CONTROL-META key sequences.

The AI Workstation does not impose a particular interface model on the user. Default interfaces exist, but the user is free to modify or add any user interface desired. Delivery applications written to run under the AI Workstation environment can choose to use one or more of the supplied user interfaces, or the designer can define a new interface.

**THE APPLICATIONS**

This section examines some of the primary types of applications the AI Workstation technology was designed to develop and run. Note that unless specified otherwise, these applications are experimental and not available for purchase.

**Diagnostic Systems**

Diagnostic systems are good examples of expert system applications. Diagnostic systems retrieve as much data as possible from instruments and/or users, and attempt to determine the cause of the problem and/or the remedy. Diagnostic system applications include medical diagnostic systems, instrument diagnostic systems, and intelligent computer-assisted instruction applications.

At HP Laboratories, we are experimenting with an 1C photolithography diagnosis system. This system, called the Photolithography Advisor, is an expert system used to diagnose failures in the negative photolithography resist stage of IC fabrication.

Within Hewlett-Packard’s computer support organization, a number of diagnostic expert systems are employed. The Schooner expert system diagnoses and corrects data communication problems between a terminal and an HP 3000. The AIDA expert system provides an efficient tool for analyzing HP 3000 core dump files. The Interactive Peripheral Troubleshooter system diagnoses disc drive failures.

**Instrument Control**

A growing class of expert systems deals with the intelligent control, monitoring, and testing of instruments, as well as the interpretation of the data gathered by these instruments. Instrument control and interpretation applications include network analysis, factory floor monitoring, process control, and many robotics applications.

At Hewlett-Packard, one experimental application helps with the interpretation and classification of data collected by a mass spectrometer. Another application analyzes data from a patient monitoring system. Within the AI industry, a number of intelligent instrument and process control applications are being developed, such as a system that monitors the operations of an oil refinery.

**Simulations**

Many complex software systems fall into the category of simulations and modeling. Simulations play major roles in nearly every aspect of a business. The object oriented programming facilities discussed earlier enable engineers to program simulations rapidly. Simulation applications include econometric modeling, flight simulation, chemical interaction modeling, and circuit simulations.

At HP Laboratories, for example, we have implemented VLSI logic simulators, which enable an engineer to design, debug, test, and evaluate circuit designs before incurring any actual manufacturing expense.

The HP Flight Planner/Flight Simulator is an application designed by HP Laboratories to illustrate a number of important features of the AI Workstation technology: namely, that multilingual applications are desirable and simple to develop, that complex applications can be developed rapidly, that Lisp applications can be designed to run without the interruption of garbage collections, and that Lisp applications can run on conventional hardware and operating systems at very high performance.

The Flight Planner module is a constraint-driven expert system for planning a flight. The system presents a detailed map of California stretching from San Francisco to Los Angeles. The pilot is asked for an originating airport, a final destination, and any intermediate stops desired. The pilot then is allowed to specify specific constraints, such as “Avoid oceans and mountain ranges,” “Ensure no longer than 3 hours between stops,” or “Plan a lunch stop in Santa Barbara.”

The system’s knowledge base includes data on the airports, the terrain, and the specifications and capabilities of a Cessna 172 airplane. With the constraints specified, the Flight Planner attempts to find a viable flight plan that satisfies the constraints specified by the pilot, as well as the constraints implied by the limitations of the terrain and aircraft.

Once a flight plan has been generated, the Flight Planner passes the flight plan off to the Flight Simulator module, which then flies the plan as specified. The flight plan specifies the destination, route, and cruise altitude for each leg of the flight. The flight simulator’s autopilot module, using these directions as well as the specific airport and airplane data from the knowledge base, performs the take-off, flies the plane using ground-based navigational aids, and executes an instrument landing.

In addition to flying predetermined flight plans via the autopilot, the Flight Simulator can be flown manually. The pilot uses an HP-HIL joystick, a 9-knob box, and a 32-button box as the controls. The Flight Planner is implemented using HP-RL.

The Flight Simulator is implemented in Common Lisp and the object-oriented extensions to Common Lisp. The graphical transformations are performed by C routines accessed from Lisp, using the 3D graphics facilities of the HP-UX operating system. The model of flight, the autopilot component, and the scene management are all written using the object oriented extensions to Common Lisp. The Flight Simulator required two months for two people to develop, while the Flight Planner required a month for three people.

**Natural Language**

With the computational and reasoning capabilities of systems such as the AI Workstation, computational linguists are making headway into the difficult field of natural language understanding. At HP Laboratories, computational linguists have been using the AI Workstation to develop an experimental, domain independent, natural language understanding system. HP’s natural language system employs a hierarchically structured lexicon, a set of lexical rules to create derived lexical items, and a small set of context-free phrase structure rules as the data structures used in parsing English sentences and questions. Interpretations of these sentences are the result of the meanings of the individual words together with the semantic rules that are associated with each of the dozen or so phrase structure rules.

What the natural language system produces is a set of unambiguous application independent expressions in first-order logic, each expression corresponding to one possible interpretation of the original sentence. In test applications, these expressions are transduced into either data base queries or messages to objects, making use of the domain-specific knowledge in each application to make precise those relations or pronoun bindings that were underspecified in the sentence itself.

**Software Engineering**

While environments such as the AI Workstation can significantly improve software productivity, we are just beginning to reap the benefits of applying AI to the software development process itself.

There are a number of projects throughout the industry working in this area. At HP Laboratories, we are working on intelligent programming environments that help the user assess the impact of potential modifications, determine which scenarios could have caused a particular bug, systematically test an application, coordinate development among teams of programmers, and support multilingual development in a uniform manner.

Other significant software engineering applications include automatic programming, syntax-directed editors, automatic program testing, and intelligent language-based help facilities. Applying AI to the software development process is a major research topic. There is tremendous potential for improving the productivity of the programmer, the quality of the resulting code, and the ability to maintain and enhance applications. One of HP’s first projects of this type is *MicroScope*, a tool to help software engineers understand the structure and behavior of complex software systems.

**CONCLUSION**

We have discussed the AI Workstation from the point of view of the software market, the underlying technology, the user environment, and the AI-based applications. Having studied the AI Workstation from each of these perspectives, we hope that the reader will assimilate this into a coherent and accurate view of the HP AI Workstation technology.

Over the coming years, HP engineers and our partner universities will be using the AI Workstation as a platform for exploring increasingly intelligent and powerful applications and technologies.

**Acknowledgments**

Since the AI Workstation is defined to be the aggregate of HP’s research in the AI area, the efforts of well over 100 people at Hewlett-Packard divisions and universities around the United States are represented. Major contributions came from Martin Griss and his Software Technology Laboratory, the Knowledge Technology Laboratory, the Interface Technology Laboratory, and the director of HP Laboratories’ Distributed Computing Center, Ira Goldstein.

The Fort Collins Systems Division, with teams led by Roger Ison and John Nairn, provided an existence proof to the computer industry of a high-performance, quality implementation of Common Lisp on conventional hardware.

The Computer Languages Laboratory developed the extensions to the AI Workstation for conventional languages. The faculty and students of the University of Utah, Professor Robert Kessler in particular, contributed greatly to the fundamental capabilities of the AI Workstation. A number of consultants from Stanford University, the University of Utah, the Rand Corporation, and the University of California at Santa Cruz continue to help us improve our technology.

This article has benefited from the insights of Ralph Hyver, Seth Fearey, Martin Griss, and Alan Snyder of HP Laboratories, and Mike Bacco and Bill Follis of Fort Collins. The author also thanks Cynthia Miller for her long hours of editing.

**Author**

Interested in programming environments, software development methodologies, and computer-assisted instruction, Marty Cagan is a project leader in the Software Technology Lab of HP Laboratories. Joining HP in 1981, he has worked on business applications for the HP 3000 Computer and the implementation of the HP Development Environment for Common Lisp product. He holds BS degrees in computer science and economics awarded in 1981 by the University of California at Santa Cruz. A member of the ACM, the AAAI, and the IEEE Computer Society, Marty is a resident of Los Altos, California.

**References**

1. M.L. Griss, E. Benson, and G.Q. Maquire, “PSL: A Portable LISP System,” 1982 ACM Symposium on LISP and Functional Programming, August 1982.
2. G.L. Steele, Common Lisp: The Language, Digital Press, 1984.
3. J.S. Birnbaum, “Toward the Domestication of Microelectronics,” Communications of the ACM, November 1985.
4. M. Stefik and D.G. Bobrow, “Object-Oriented Programming: Themes and Variations,” The AI Magazine, January 1986.
5. A. Snyder, Object-Oriented Programming for Common Lisp, HP Laboratories Technical Report ATC-85-1, February 1985.
6. S. Rosenberg, “HP-RL: A Language for Building Expert Systems,” Proceedings of the Eighth international Joint Conference on Artificial Intelligence, August 1983.
7. R. Fikes and T. Kehler, “The Role of Frame-Based Representation in Reasoning,” Communications of the ACM, September 1985.
8. R.M. Stallman, “EMACS: The Extensible, Customizable, Self Documenting Display Editor,” in Barstow, Shrobe, and Sandewall, Interactive Programming Environments, McGraw-Hill, 1984.
9. A. 251, “Computer Software,” Scientific American, Vol. 251, no. 3, September 1984.
10. T. Cline, W. Fong, and S. Rosenberg, “An Expert Advisor for Photolithography,” Proceedings of the Ninth International Joint Conference on Artificial Intelligence, August 1985.
11. R.L. Moore, L.B. Hawkinson, C.G. Knickerbocker, and L.M. Churchman, “A Real-Time Expert System for Process Control,” Proceedings of the 1984 Conference on Artificial Intelligence Applications, December 1984.
12. C.J. Pollard and L.G. Creary, “A Computational Semantics for Natural Language,” Proceedings of the Association for Computational Linguistics, July 1985.
13. D. Proudian, and C. Pollard, “Parsing Head-Driven Phrase Structure Grammar,” Proceedings of the Association for Computational Linguistics, July 1985.
14. D. Flickenger, C. Pollard, and T. Wasow, “Structure-Sharing in Lexical Representation,” Proceedings of the Association for Computational Linguistics, July 1985.
15. M.L. Griss and T.C. Miller, UPE: A Unified Programming Environment, HP Laboratories Technical Report STL-85-07, December 1985.
16. D.R. Barstow and H.E. Shrobe, “From Interactive to Intelligent Programming Environments,” in Barstow, Shrobe, and Sandewall, Interactive Programming Environments, McGraw-Hill, 1984.
