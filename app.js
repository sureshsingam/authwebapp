import {
    getAuth,
    createUserWithEmailAndPassword,
    onAuthStateChanged, 
    signOut, 
    signInWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
        
 } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js"


import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
}from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js"


import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
}from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js"



 //create the auth object
const auth = getAuth();
const mainView = document.getElementById('main-view');
const storage = getStorage();

//get instance of the firebase firestore object
const db=getFirestore();


const emailVerificationView = document.getElementById('email-verification');
//get resend email verificaiton button
const resendEmailBtn = document.getElementById('resend-email-btn');

const forgotPasswordView = document.getElementById('reset-password-form');
const forgotPasswordBtn = document.getElementById('forgot-password-btn');
const resetPasswordBtn = document.getElementById('reset-password-btn');
const resetEmailField = document.getElementById('reset-password-email');
const UIResetPwdMessage = document.getElementById('rp-message');

const name = document.getElementById('name');
const phoneNumber = document.getElementById('phone-number');
const email = document.getElementById('email');
const password = document.getElementById('password');
const signUpBtn = document.getElementById('signup-btn');
const UIErrorMessage = document.getElementById('error-message');
const UIErrorMessage2 = document.getElementById('error-messageLogin');
const haveAnAccountBtn = document.getElementById('have-an-account-btn');

const signUpFormView = document.getElementById('signup-form');
const userProfileView = document.getElementById('user-profile');


// Get Profile View Elements
const profileName = document.getElementById('profile-name'); 
const profilePhoneNumber = document.getElementById('profile-phone-number');
const profileEmail = document.getElementById('profile-email');
const profileUpdateBtn = document.getElementById('update-profile-btn');
const profileMessage = document.getElementById('profile-message');
const userProfileImage = document.getElementById('image-file-input');
let userImage = null;
const profilePictureImage = document.getElementById('profile-picture-image');
const profilePictureUpdateImage = document.getElementById('update-image-file-input');

const UIuserEmail = document.getElementById('user-email');
const logOutBtn = document.getElementById('logout-btn');

const loginForm = document.getElementById('login-form');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const loginBtn = document.getElementById('login-btn');
const needAnAccountBtn = document.getElementById('need-an-account-btn');
const loginWithGoogleBtn = document.getElementById('login-with-google-btn');
const loginWithFacebookBtn = document.getElementById('login-with-facebook-btn');

onAuthStateChanged(auth, async (user) => {
    if(user){

        if(user.emailVerified === false){
            
            emailVerificationView.style.display = 'block'; // show the email verification view
            userProfileView.style.display = 'none'; //hide the user profile view
        }else{
            // if emailVerified is true, hide the emailverification view and show the user profile view
            // Also get the profile image from cloud storage and show in the user profile view
            userProfileView.style.display = 'block'; //show the user profile view
            UIuserEmail.innerHTML = user.email;
            emailVerificationView.style.display = 'none'; // hide the email verification view
            
            try{

                const docRef = doc(db,"users",user.uid);
                const docSnap = await getDoc(docRef);
                //get the data from the document snapshot and display in the profile name, phone number and email fields
                
                profileName.value = docSnap.data().name;
                profileEmail.value = docSnap.data().email;
                profilePhoneNumber.value = docSnap.data().phoneNumber;
                console.log(docSnap.data());
                console.log(user.uid)
                console.log(docSnap.data().name);
                console.log(docSnap.data().email);
                console.log(docSnap.data().phoneNumber);

                const fileRef = ref(storage, `user_images/${user.uid}/${user.uid}-mascot}`);
                // const profileImageUrl = await getDownloadURL(fileRef);
                // console.log(profileImageUrl);
                // profilePictureImage.src = profileImageUrl;

            }catch(error){
                console.log(error);
            }
            
        }

        signUpFormView.style.display = 'none'; // hide sign up form
        loginForm.style.display = 'none'; // hide login form

    }
    else{
       //signUpFormView.style.display = 'block'; // show sign up form
       loginForm.style.display = 'block'; // show login form
       userProfileView.style.display = 'none'; // hide user profile view
    }
    mainView.classList.remove('loading');
});


const signUpButtonPressed = async(e) => {
    e.preventDefault();
    try{
        const userCredential = await createUserWithEmailAndPassword(auth,email.value,password.value); //create the user
        await sendEmailVerification(userCredential.user);
        const docRef = doc(db, "users",userCredential.user.uid);
        await setDoc(docRef,{
            name: name.value,
            phoneNumber: phoneNumber.value,
            email: email.value,
        });

        const storageRef = ref(storage, `user_images/${userCredential.user.uid}/${userImage.name}`);
        await uploadBytes(storageRef, userImage)
        console.log(userCredential);

    }
    catch(error){
        console.log(error.code);
        UIErrorMessage.innerHTML = formatErrorMessage(error.code);
        UIErrorMessage.classList.add('visible');
    }
    

};


const logOutButtonPressed = async () => {
    try{
        await signOut(auth);
        email.value = "";
        password.value = "";
    }
    catch(error){
        console.log(error);
    } 

};

const loginButtonPressed = async(e) => {
    e.preventDefault();
    console.log(loginEmail.value, loginPassword.value);
    try{
        const userCredential = await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value);
        console.log(userCredential)
        loginEmail.value = "";
        loginPassword.value = "";
        UIErrorMessage2.classList.remove('visible');

    }
    catch(error){
        console.log(error.code);
        UIErrorMessage2.innerHTML = formatErrorMessage(error.code);
        UIErrorMessage2.classList.add('visible');

    }
    

};

const needAnAccountBtnPressed = () => {
    email.value = "";
    password.value = "";
    UIErrorMessage.classList.remove('visible');
    signUpFormView.style.display = 'block'; //display sign up form
    loginForm.style.display = 'none'; // hide login form

}

const haveAnAccountBtnPressed = () => {
    loginEmail.value = "";
    loginPassword.value = "";
    UIErrorMessage2.classList.remove('visible');
    signUpFormView.style.display = 'none'; // hide sign up form
    loginForm.style.display = 'block'; //display login form

}

const resendButtonPressend = async() => {
    try{
        const user = auth.currentUser;
        console.log(user);
        await sendEmailVerification(user)

    }
    catch(error){
        console.log(error);
    }


}
const forgotPasswordBtnPressed = () =>{
    UIResetPwdMessage.classList.remove('visible');
    UIResetPwdMessage.classList.add('hidden');
    // show the forgot password view
    forgotPasswordView.style.display = 'block';
    // hide the login form view
    loginForm.style.display = 'none'; //display login form
}


const resetPasswordBtnPressed = async(e) =>{
    e.preventDefault();
    // get email address from the reset email field
    const emailAddress = resetEmailField.value;
    try {
        await sendPasswordResetEmail(auth, emailAddress);
        console.log(auth);

        UIResetPwdMessage.innerHTML=`Email is on the way to ${emailAddress}! Please follow directions in the email to reset your password!`;
        UIResetPwdMessage.classList.add('success');
    } catch (error) {
        console.log(error.code);
        //UIResetPwdMessage.innerHTML = formatErrorMessage(error.code);
        UIResetPwdMessage.innerHTML = "Please provide a valid registered email address";
        UIResetPwdMessage.classList.add('error');
  
    }
    UIResetPwdMessage.classList.remove('hidden');
    UIResetPwdMessage.classList.add('visible');
    
}


const loginWithGoogleBtnPressed = async(e) =>{
    e.preventDefault();
    try{
        const googleProvider = new GoogleAuthProvider();
        await signInWithPopup(auth, googleProvider);
    }
    catch(error){
        console.log(error.code);
    }

}

const loginWithFacebookBtnPressed = async(e) =>{
    e.preventDefault();
    try{
        const facebookProvider = new FacebookAuthProvider();
        await signInWithPopup(auth, facebookProvider);

    }
    catch(error){
        console.log(error.code);
    }

}

const profileUpdateBtnPressed = async(e) =>{
    e.preventDefault();
  
    try{
        console.log("Before Update(Profile Name):",profileName.value);
        console.log("Before Update(Profile Phone Number):",profilePhoneNumber.value);
        console.log("Before Update(Profile Email):",profileEmail.value);

        const user = auth.currentUser;
        console.log("Current User",user.uid);

        const docRef = doc(db, "users",user.uid);
        
        await setDoc(docRef,{
            name: profileName.value,
            phoneNumber: profilePhoneNumber.value,
            email: profileEmail.value,
        });
        //const updateStorageRef = ref(storage, `user_images/${user.uid}/${user.uid}-mascot}`);
        //await uploadBytes(updateStorageRef, userImage);

        profileMessage.classList.remove('hidden');
        profileMessage.classList.add('visible');
        profileMessage.classList.add('success');
        profileMessage.innerHTML = "Profile Updated"
        console.log("Profile Updated");
    }catch(error){
        console.log(error.code);
        profileMessage.innerHTML = `error.code${error.code}`;
        profileMessage.classList.add('error');
        profileMessage.classList.remove('hidden');
        profileMessage.classList.add('visible');
    }
 
}

const imageFileChosen = async(e) =>{

  
    try{
    // get the image chosen by the user through the event
    console.log(e.target.files[0]);
    userImage = e.target.files[0];

    }catch(error){
        console.log(error.code);

    }
 
}



const updateImageFileChosen = async(e) =>{

  
    try{
    // get the image chosen by the user through the event
    console.log(e.target.files[0]);
    userImage = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = (e) =>{
        console.log(e.target.result);
        profilePictureImage.src = e.target.result;
    };

    }catch(error){
        console.log(error.code);

    }
 
}


signUpBtn.addEventListener('click', signUpButtonPressed);
logOutBtn.addEventListener('click', logOutButtonPressed);
loginBtn.addEventListener('click', loginButtonPressed);
needAnAccountBtn.addEventListener('click', needAnAccountBtnPressed);
haveAnAccountBtn.addEventListener('click', haveAnAccountBtnPressed);
resendEmailBtn.addEventListener('click', resendButtonPressend);
forgotPasswordBtn.addEventListener('click', forgotPasswordBtnPressed);
resetPasswordBtn.addEventListener('click', resetPasswordBtnPressed);
loginWithGoogleBtn.addEventListener('click', loginWithGoogleBtnPressed);
loginWithFacebookBtn.addEventListener('click', loginWithFacebookBtnPressed);
profileUpdateBtn.addEventListener('click', profileUpdateBtnPressed);
userProfileImage.addEventListener('change', imageFileChosen); // listens for the change event as soon as the user selects an image file
profilePictureUpdateImage.addEventListener('change', updateImageFileChosen); // listens for the change event as soon as the user selects an image file


const formatErrorMessage = (errorCode) => {
    let message = "";
    if(errorCode === "auth/invalid-email" || errorCode === "auth/missing-email"){
        message = "Please enter a valid email address";
    }
    else if(errorCode === "auth/missing-password"){
        message = "Please enter password";
    }
    else if (errorCode === "auth/weak-password"){
        message = "Password should be at least 6 characters";

    }
    else if (errorCode === "auth/email-already-in-use"){
        message = "Email is already in use. Please use a different email address";
    }
    else if (errorCode === "auth/invalid-credential"){
        message = "User not found, please sign up"
    }
    else{
        message = "Something went wrong, please contact us to resolve the issue";
    }

    return message;
}